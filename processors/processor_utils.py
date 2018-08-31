import os.path
from shutil import copyfile

import io
import re
import sys
import string
import shlex
import subprocess
import math
import json
import operator

import nltk

from collections import Counter

# list of words that should not be in the count
filter_list = ['a', 'the', 'of', 'to', 'is', 'for', 'it', 'and']

hint_path = "hint_generation_files/"
target_path = "node_modules/codemirror/addon/hint/"

hint_upper_half_fn = hint_path + "hint_upper_half"
hint_lower_half_fn = hint_path + "hint_lower_half"

def generateWordTable(text):
    # remove digits using regex
    digitlessText = re.sub(r'[0-9]+', '', text)
    # remove punctuations
    regex = re.compile('[%s]' % re.escape(string.punctuation))
    punctlessText = regex.sub(' ', digitlessText)
    wordBag = punctlessText.lower().split()

    '''
    only select words not in the filter list
    and size > 3 (remove punctuation and short words)
    at the same time convert unicode to normal string in python 
    '''
    wordBag = [x for x in wordBag 
               if (x not in filter_list and len(x) > 3)]

    bigramBag = list(nltk.bigrams(wordBag))
    #trigramBag = list(nltk.trigrams(wordBag))

    bigramBag = [' '.join(x) for x in bigramBag]
    #trigramBag = [' '.join(x) for x in trigramBag]

    gramBag = []
    gramBag.extend(wordBag)
    gramBag.extend(bigramBag)
    #gramBag.extend(trigramBag)

    print(gramBag)

    return Counter(gramBag)

def combineCounter(counter_list):
    temp = Counter({})
    for i in range(0, len(counter_list)):
        temp += counter_list[i]

    return temp

def fileAllIn(fn):
    f = open(fn, 'r')
    content = f.read()
    f.close()

    return content

def counterToList(counter_table):
    counter_list = list(counter_table.items())
    return [x[0] for x in counter_list]

def toJSCommand(word):
    return 'javascriptKeywords.push("' + word + '"); \n'

def generateHint(wordTable):
    # copy the new show hint file into the node_module
    copyfile("hint_generation_files/show-hint.js", target_path + "show-hint.js")

    hint_file = open(target_path + "javascript-hint.js", 'w')
    upper_content = fileAllIn(hint_upper_half_fn)
    lower_content = fileAllIn(hint_lower_half_fn)

    word_list = counterToList(wordTable)
    hint_content = ' '.join([toJSCommand(x) for x in word_list])
    hint_contents = upper_content + hint_content + lower_content

    hint_file.write(hint_contents)
    hint_file.close()
