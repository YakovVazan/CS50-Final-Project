from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/process_data", methods=["POST"])
def process_data():
    try:
        data = request.get_json()

        # Process the data (e.g., insert into database)
        # You can replace this with your desired logic

        response = {"message": f"Processed data: {data['data']}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"message": "Error processing data"}
        return jsonify(response), 500

if __name__ == "__main__":
    app.run(debug=True)
