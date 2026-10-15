from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# Configure SQLite Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///file_manager.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Model
class FileSystemItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    item_type = db.Column(db.String(10), nullable=False)  # 'folder' or 'file'
    content = db.Column(db.Text, nullable=True)           # Optional text for files
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'item_type': self.item_type,
            'content': self.content,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

# Create database tables
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

# API Route: Fetch all items
@app.route('/api/items', methods=['GET'])
def get_items():
    items = FileSystemItem.query.order_by(FileSystemItem.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])

# API Route: Create a folder or file
@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.json
    name = data.get('name')
    item_type = data.get('type')
    content = data.get('content', '')

    if not name or item_type not in ['folder', 'file']:
        return jsonify({'error': 'Invalid name or type'}), 400

    new_item = FileSystemItem(name=name, item_type=item_type, content=content)
    db.session.add(new_item)
    db.session.commit()

    return jsonify(new_item.to_dict()), 201

if __name__ == '__main__':
    app.run(debug=True)
