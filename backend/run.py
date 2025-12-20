import os
from app import create_app

# Create the application instance using the factory
app = create_app()

if __name__ == "__main__":
    # Check environment mode
    is_production = os.environ.get('FLASK_ENV', 'development') == 'production'
    debug_mode = not is_production
    host = '0.0.0.0' if is_production else '127.0.0.1'
    port = int(os.environ.get('PORT', 5000))
    
    print(f"Running in {'production' if is_production else 'development'} mode")
    app.run(debug=debug_mode, host=host, port=port)

