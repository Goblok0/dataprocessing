import json

with open('shark.json', 'r') as shark_data:
    data = json.load(shark_data)
    # print(data)
    for key in data:
        print(key)
        print(key.get("location"))
        quit()
