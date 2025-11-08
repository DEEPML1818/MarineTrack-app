#!/usr/bin/env python3
from scgraph.geographs.marnet import marnet_geograph
import json
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime, timedelta
import math

app = Flask(__name__)
CORS(app)

# Crowdsourced hazard data storage
HAZARDS_FILE = 'data/maritime_hazards.json'
TRAFFIC_FILE = 'data/vessel_traffic.json'
PREDICTIONS_FILE = 'data/route_predictions.json'

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get('PGHOST'),
        database=os.environ.get('PGDATABASE'),
        user=os.environ.get('PGUSER'),
        password=os.environ.get('PGPASSWORD'),
        port=os.environ.get('PGPORT')
    )

# Initialize ports table
def init_ports_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create ports table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS ports (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            code VARCHAR(10) UNIQUE NOT NULL,
            country VARCHAR(100),
            lat DECIMAL(9, 6) NOT NULL,
            lng DECIMAL(9, 6) NOT NULL
        )
    ''')
    
    # Check if ports table is empty
    cur.execute('SELECT COUNT(*) FROM ports')
    count = cur.fetchone()[0]
    
    if count == 0:
        # Insert port data
        ports_data = [
            ("Mumbai Port", "INMUN", "India", 18.9388, 72.8354),
            ("Chennai Port", "INMAA", "India", 13.0827, 80.2707),
            ("Kochi Port", "INCOK", "India", 9.9674, 76.2376),
            ("Visakhapatnam Port", "INVTZ", "India", 17.6868, 83.2185),
            ("Colombo Port", "LKCMB", "Sri Lanka", 6.9497, 79.8528),
            ("Singapore Port", "SGSIN", "Singapore", 1.2644, 103.8270),
            ("Dubai Port", "AEDXB", "UAE", 25.2697, 55.3095),
            ("Shanghai Port", "CNSHA", "China", 31.2304, 121.4737),
            ("Hong Kong Port", "HKHKG", "Hong Kong", 22.3193, 114.1694),
            ("Rotterdam Port", "NLRTM", "Netherlands", 51.9225, 4.4792),
            ("Hamburg Port", "DEHAM", "Germany", 53.5511, 9.9937),
            ("New York Port", "USNYC", "USA", 40.6895, -74.0445),
            ("Los Angeles Port", "USLAX", "USA", 33.7405, -118.2713),
            ("Tokyo Port", "JPTYO", "Japan", 35.6286, 139.7454),
            ("Sydney Port", "AUSYD", "Australia", -33.8568, 151.2153),
            ("Cape Town Port", "ZACPT", "South Africa", -33.9079, 18.4231),
            ("Rio de Janeiro Port", "BRRIO", "Brazil", -22.8969, -43.1732),
            ("London Port", "GBLON", "UK", 51.5074, -0.1278),
            ("Marseille Port", "FRMRS", "France", 43.2965, 5.3698),
            ("Barcelona Port", "ESBCN", "Spain", 41.3851, 2.1734),
            ("Jeddah Port", "SAJED", "Saudi Arabia", 21.5433, 39.1728),
            ("Karachi Port", "PKKHI", "Pakistan", 24.8607, 67.0011),
            ("Bangkok Port", "THBKK", "Thailand", 13.7563, 100.5018),
            ("Manila Port", "PHMNL", "Philippines", 14.5995, 120.9842),
            ("Jakarta Port", "IDJKT", "Indonesia", -6.2088, 106.8456)
        ]
        
        cur.executemany(
            'INSERT INTO ports (name, code, country, lat, lng) VALUES (%s, %s, %s, %s, %s)',
            ports_data
        )
    
    conn.commit()
    cur.close()
    conn.close()

# Search ports endpoint
@app.route('/api/ports/search', methods=['GET'])
def search_ports():
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify({'ports': []})
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('''
        SELECT * FROM ports 
        WHERE LOWER(name) LIKE %s OR LOWER(code) LIKE %s OR LOWER(country) LIKE %s
        ORDER BY name
        LIMIT 10
    ''', (f'%{query}%', f'%{query}%', f'%{query}%'))
    
    ports = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify({'ports': ports})

# Get all ports endpoint
@app.route('/api/ports', methods=['GET'])
def get_all_ports():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('SELECT * FROM ports ORDER BY name')
    ports = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({'ports': ports})

# Report maritime hazard (crowdsourced)
@app.route('/api/hazards/report', methods=['POST'])
def report_hazard():
    data = request.json
    
    hazard = {
        'id': f"h_{int(datetime.now().timestamp())}",
        'type': data.get('type'),  # debris, shallow, weather, congestion, regulatory
        'severity': data.get('severity', 'medium'),  # low, medium, high, critical
        'lat': float(data.get('lat')),
        'lng': float(data.get('lng')),
        'description': data.get('description'),
        'reportedBy': data.get('reportedBy', 'anonymous'),
        'vesselId': data.get('vesselId'),
        'timestamp': datetime.now().isoformat(),
        'expiresAt': (datetime.now() + timedelta(hours=data.get('expiryHours', 24))).isoformat(),
        'verified': False,
        'upvotes': 0,
        'downvotes': 0
    }
    
    # Load existing hazards
    hazards = load_json_file(HAZARDS_FILE, [])
    hazards.append(hazard)
    
    # Remove expired hazards
    hazards = [h for h in hazards if datetime.fromisoformat(h['expiresAt']) > datetime.now()]
    
    save_json_file(HAZARDS_FILE, hazards)
    
    return jsonify({'success': True, 'hazard': hazard})

# Get active hazards in area
@app.route('/api/hazards/nearby', methods=['GET'])
def get_nearby_hazards():
    lat = float(request.args.get('lat'))
    lng = float(request.args.get('lng'))
    radius = float(request.args.get('radius', 50))  # km
    
    hazards = load_json_file(HAZARDS_FILE, [])
    
    # Filter expired hazards
    active_hazards = [h for h in hazards if datetime.fromisoformat(h['expiresAt']) > datetime.now()]
    
    # Filter by distance
    nearby = []
    for hazard in active_hazards:
        dist = calculate_distance_nm(
            {'lat': lat, 'lng': lng},
            {'lat': hazard['lat'], 'lng': hazard['lng']}
        ) * 1.852  # Convert to km
        
        if dist <= radius:
            hazard['distance'] = round(dist, 2)
            nearby.append(hazard)
    
    # Sort by severity and distance
    severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    nearby.sort(key=lambda x: (severity_order.get(x['severity'], 4), x['distance']))
    
    save_json_file(HAZARDS_FILE, active_hazards)
    
    return jsonify({'hazards': nearby})

# Vote on hazard (verify crowdsourced data)
@app.route('/api/hazards/<hazard_id>/vote', methods=['POST'])
def vote_hazard(hazard_id):
    data = request.json
    vote = data.get('vote')  # 'up' or 'down'
    
    hazards = load_json_file(HAZARDS_FILE, [])
    
    for hazard in hazards:
        if hazard['id'] == hazard_id:
            if vote == 'up':
                hazard['upvotes'] += 1
            elif vote == 'down':
                hazard['downvotes'] += 1
            
            # Auto-verify if enough upvotes
            if hazard['upvotes'] >= 3:
                hazard['verified'] = True
            
            # Remove if too many downvotes
            if hazard['downvotes'] >= 5:
                hazards.remove(hazard)
                save_json_file(HAZARDS_FILE, hazards)
                return jsonify({'success': True, 'removed': True})
            
            save_json_file(HAZARDS_FILE, hazards)
            return jsonify({'success': True, 'hazard': hazard})
    
    return jsonify({'success': False, 'error': 'Hazard not found'}), 404

# Report vessel traffic/congestion
@app.route('/api/traffic/report', methods=['POST'])
def report_traffic():
    data = request.json
    
    traffic_report = {
        'id': f"t_{int(datetime.now().timestamp())}",
        'lat': float(data.get('lat')),
        'lng': float(data.get('lng')),
        'density': data.get('density', 'medium'),  # low, medium, high, critical
        'vesselCount': data.get('vesselCount', 0),
        'portCode': data.get('portCode'),
        'timestamp': datetime.now().isoformat(),
        'reportedBy': data.get('vesselId', 'anonymous')
    }
    
    traffic_data = load_json_file(TRAFFIC_FILE, [])
    traffic_data.append(traffic_report)
    
    # Keep only last 1000 reports
    traffic_data = traffic_data[-1000:]
    
    save_json_file(TRAFFIC_FILE, traffic_data)
    
    return jsonify({'success': True, 'report': traffic_report})

# Get traffic heatmap data
@app.route('/api/traffic/heatmap', methods=['GET'])
def get_traffic_heatmap():
    traffic_data = load_json_file(TRAFFIC_FILE, [])
    
    # Filter to last 24 hours
    cutoff = datetime.now() - timedelta(hours=24)
    recent_traffic = [t for t in traffic_data if datetime.fromisoformat(t['timestamp']) > cutoff]
    
    return jsonify({'traffic': recent_traffic})

# Calculate maritime route endpoint with AI optimization
@app.route('/api/route/calculate', methods=['POST'])
def calculate_route():
    data = request.json
    
    origin = data.get('origin')
    destination = data.get('destination')
    preferences = data.get('preferences', {})
    
    if not origin or not destination:
        return jsonify({'error': 'Origin and destination are required'}), 400
    
    # Extract coordinates
    origin_lat = float(origin['lat'])
    origin_lng = float(origin['lng'])
    destination_lat = float(destination['lat'])
    destination_lng = float(destination['lng'])
    
    try:
        # Calculate primary maritime route using scgraph (10x faster than searoute!)
        route = marnet_geograph.get_shortest_path(
            origin_node={"latitude": origin_lat, "longitude": origin_lng},
            destination_node={"latitude": destination_lat, "longitude": destination_lng},
            output_units='km'
        )
        
        # Load hazards and traffic data for AI optimization
        hazards = load_json_file(HAZARDS_FILE, [])
        active_hazards = [h for h in hazards if datetime.fromisoformat(h['expiresAt']) > datetime.now()]
        traffic_data = load_json_file(TRAFFIC_FILE, [])
        recent_traffic = [t for t in traffic_data if 
                         datetime.fromisoformat(t['timestamp']) > datetime.now() - timedelta(hours=6)]
        
        # Extract waypoints from scgraph output
        distance_km = route['length']
        distance_nm = distance_km * 0.539957  # Convert km to nautical miles
        
        # Calculate duration based on speed
        speed_knots = preferences.get('speed', 15)
        duration_hours = distance_nm / speed_knots if speed_knots > 0 else 0
        
        # Convert waypoints to lat/lng format
        formatted_waypoints = [
            {'lat': point['latitude'], 'lng': point['longitude']} 
            for point in route['coordinate_path']
        ]
        
        # AI Route Scoring: Analyze route for hazards and traffic
        route_hazards = []
        traffic_density = 'low'
        safety_score = 100
        
        for waypoint in formatted_waypoints:
            # Check for nearby hazards
            for hazard in active_hazards:
                dist = calculate_distance_nm(waypoint, {'lat': hazard['lat'], 'lng': hazard['lng']})
                if dist < 5:  # Within 5nm
                    route_hazards.append({
                        'type': hazard['type'],
                        'severity': hazard['severity'],
                        'distance': round(dist, 2),
                        'description': hazard['description'],
                        'waypoint': waypoint
                    })
                    # Decrease safety score based on severity
                    severity_impact = {'low': 5, 'medium': 10, 'high': 20, 'critical': 40}
                    safety_score -= severity_impact.get(hazard['severity'], 10)
            
            # Check traffic density
            nearby_traffic = [t for t in recent_traffic if 
                            calculate_distance_nm(waypoint, {'lat': t['lat'], 'lng': t['lng']}) < 10]
            if len(nearby_traffic) > 5:
                traffic_density = 'high'
                safety_score -= 15
            elif len(nearby_traffic) > 2:
                traffic_density = 'medium'
                safety_score -= 5
        
        safety_score = max(0, min(100, safety_score))
        
        # Create turn-by-turn directions
        directions = []
        for i in range(len(formatted_waypoints) - 1):
            wp1 = formatted_waypoints[i]
            wp2 = formatted_waypoints[i + 1]
            
            # Calculate bearing between waypoints
            bearing = calculate_bearing(wp1['lat'], wp1['lng'], wp2['lat'], wp2['lng'])
            direction = bearing_to_direction(bearing)
            
            if i == 0:
                directions.append({
                    'instruction': f'Head {direction}',
                    'distance': '',
                    'waypoint': wp1
                })
            else:
                directions.append({
                    'instruction': f'Continue {direction}',
                    'distance': f'{calculate_distance_nm(formatted_waypoints[i-1], wp1):.1f} nm',
                    'waypoint': wp1
                })
        
        # Add final destination
        directions.append({
            'instruction': 'Arrive at destination',
            'distance': f'{calculate_distance_nm(formatted_waypoints[-2], formatted_waypoints[-1]):.1f} nm',
            'waypoint': formatted_waypoints[-1]
        })
        
        # Generate AI predictions
        prediction = {
            'estimatedDelay': calculate_delay_prediction(route_hazards, traffic_density),
            'weatherRisk': 'low',  # Can be enhanced with weather API
            'collisionRisk': 'low' if safety_score > 70 else 'medium' if safety_score > 40 else 'high',
            'fuelEfficiency': calculate_fuel_efficiency(distance_nm, traffic_density),
            'recommendedSpeed': preferences.get('speed', 15) if traffic_density == 'low' else max(10, preferences.get('speed', 15) - 3)
        }
        
        # AI Recommendations
        recommendations = []
        if safety_score < 70:
            recommendations.append('⚠️ Route has multiple hazards. Consider alternative route.')
        if traffic_density == 'high':
            recommendations.append('🚦 High traffic expected. Allow extra time.')
        if len(route_hazards) > 0:
            recommendations.append(f'📍 {len(route_hazards)} hazards detected along route. Stay alert.')
        
        # Generate alternative routes (simplified - offset by 0.1 degrees)
        alternative_routes = []
        if preferences.get('showAlternatives', True) and (safety_score < 80 or traffic_density != 'low'):
            # Offset route slightly for alternative
            alt_waypoints = [{'lat': w['lat'] + 0.05, 'lng': w['lng']} for w in formatted_waypoints]
            alternative_routes.append({
                'name': 'Scenic Route',
                'coordinates': alt_waypoints,
                'distance': distance_nm * 1.1,
                'duration': duration_hours * 1.15 * 60,
                'safetyScore': min(100, safety_score + 10),
                'hazards': max(0, len(route_hazards) - 1)
            })
        
        return jsonify({
            'route': {
                'coordinates': formatted_waypoints,
                'distance': distance_nm,
                'duration': duration_hours * 60,
                'directions': directions,
                'origin': origin,
                'destination': destination,
                'safetyScore': safety_score,
                'trafficDensity': traffic_density,
                'hazards': route_hazards,
                'prediction': prediction,
                'recommendations': recommendations,
                'alternativeRoutes': alternative_routes
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_bearing(lat1, lng1, lat2, lng2):
    """Calculate bearing between two points"""
    import math
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    lng_diff = math.radians(lng2 - lng1)
    
    x = math.sin(lng_diff) * math.cos(lat2_rad)
    y = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(lng_diff)
    
    bearing = math.atan2(x, y)
    bearing = math.degrees(bearing)
    bearing = (bearing + 360) % 360
    
    return bearing

def bearing_to_direction(bearing):
    """Convert bearing to compass direction"""
    directions = ['North', 'NE', 'East', 'SE', 'South', 'SW', 'West', 'NW']
    index = round(bearing / 45) % 8
    return directions[index]

def calculate_distance_nm(point1, point2):
    """Calculate distance in nautical miles between two points"""
    import math
    
    lat1 = math.radians(point1['lat'])
    lng1 = math.radians(point1['lng'])
    lat2 = math.radians(point2['lat'])
    lng2 = math.radians(point2['lng'])
    
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    # Earth radius in nautical miles
    R = 3440.065
    
    return R * c

def load_json_file(filepath, default=None):
    """Load JSON data from file"""
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
    return default if default is not None else {}

def save_json_file(filepath, data):
    """Save JSON data to file"""
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving {filepath}: {e}")
        return False

def calculate_delay_prediction(hazards, traffic_density):
    """Predict potential delays based on hazards and traffic"""
    delay_minutes = 0
    
    for hazard in hazards:
        severity_delays = {'low': 5, 'medium': 10, 'high': 20, 'critical': 45}
        delay_minutes += severity_delays.get(hazard['severity'], 10)
    
    traffic_delays = {'low': 0, 'medium': 15, 'high': 30, 'critical': 60}
    delay_minutes += traffic_delays.get(traffic_density, 0)
    
    return delay_minutes

def calculate_fuel_efficiency(distance_nm, traffic_density):
    """Calculate estimated fuel efficiency"""
    base_consumption = distance_nm * 0.5  # liters per nm
    
    if traffic_density == 'high':
        base_consumption *= 1.2  # 20% more fuel in heavy traffic
    elif traffic_density == 'medium':
        base_consumption *= 1.1
    
    return round(base_consumption, 2)

if __name__ == '__main__':
    # Initialize database
    init_ports_db()
    
    # Initialize data directory
    os.makedirs('data', exist_ok=True)
    
    # Start Flask server
    port = int(os.environ.get('PORT', 3001))
    print(f"Maritime AI Routing Service starting on port {port}")
    print("Features: Crowdsourced hazards, Traffic intelligence, AI predictions")
    app.run(host='0.0.0.0', port=port, debug=True)
