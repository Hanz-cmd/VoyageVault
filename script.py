# Create a complete Smart Trip Capture + Expense Tracker project structure
# Let's create all the necessary files for the project

import os

# Create project directory structure
project_structure = {
    'static': ['style.css'],
    'templates': ['index.html', 'dashboard.html'],
    'uploads': [],  # For uploaded receipt images
    'data': []  # For storing data files
}

# Create directories
for directory, files in project_structure.items():
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")
    for file in files:
        file_path = os.path.join(directory, file)
        if not os.path.exists(file_path):
            with open(file_path, 'w') as f:
                f.write('')  # Create empty file
            print(f"Created file: {file_path}")

print("Project structure created successfully!")