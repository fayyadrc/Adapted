from app import create_app

# Create the application instance using the factory
app = create_app()

if __name__ == "__main__":
    # Runs the app in debug mode on port 5000
    app.run(debug=True, port=5001)

