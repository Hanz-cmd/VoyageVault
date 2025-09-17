from flask import Flask, render_template, request, redirect, url_for
import os
import pytesseract
from PIL import Image
import folium

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index_1.html')

if __name__ == '__main__':
    app.run(debug=True)


def extract_receipt_data(image_path):
    # Process uploaded receipt image
    text = pytesseract.image_to_string(Image.open(image_path))
    # Parse amount and merchant info
    return parsed_data


def create_trip_map(trips, expenses):
    map_obj = folium.Map(location=[28.6139, 77.2090])
    # Add trip routes and expense markers
    return map_obj._repr_html_()
