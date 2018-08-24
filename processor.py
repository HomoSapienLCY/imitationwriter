from processor_utils import *

from flask import Flask, jsonify
from flask import abort
from flask import make_response
from flask import request

app = Flask(__name__)

word_tables = []

# legacy code using a different mechanism (posting filename
# other than content)
'''
@app.route('/nexus', methods=['POST'])
def create_task():
    if not request.json:
        abort(400)
    task = {
        'filePaths': request.json['filePaths'],
        'done': False
    }
    
    totalText = ""

    filePaths = task['filePaths']
    for fp in filePaths:
        totalText += extract_text_by_page(fp)

    word_table = generateWordTable(totalText)
    word_tables.append(word_table)
    whole_table = combineCounter(word_tables)
    generateHint(whole_table)
    top_3 = whole_table.most_common(3)
    print(whole_table)
    print(top_3)
    # this line is important, if not flushed, the prints will be
    # send only after electron exiting
    sys.stdout.flush()
    # 201 is the state
    reply = {'reply': {'0': top_3[0], '1': top_3[1], '2': top_3[2]}}
    return jsonify(reply), 201
'''

# allow user to post new data
@app.route('/nexus', methods=['POST'])
def create_task():
    if not request.json:
        abort(400)
    task = {
        'pageNum': request.json['pageNum'],
        'description': request.json.get('description', ""),
        'done': False
    }
    word_table = generateWordTable(task['description'])
    word_tables.append(word_table)
    whole_table = combineCounter(word_tables)
    generateHint(whole_table)
    top_3 = whole_table.most_common(3)
    print(whole_table)
    print(top_3)
    # this line is important, if not flushed, the prints will be
    # send only after electron exiting
    sys.stdout.flush()
    # 201 is the state
    reply = {'reply': {'0': top_3[0], '1': top_3[1], '2': top_3[2]}}
    return jsonify(reply), 201

# error catching
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

if __name__ == '__main__':
    app.run(debug=True)