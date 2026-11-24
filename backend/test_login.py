import requests

url = "http://127.0.0.1:5000/api/login"

data = {
    "email": "newuser123@finverse.com",
    "password": "Test@12345"
}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response:")
print(response.json())