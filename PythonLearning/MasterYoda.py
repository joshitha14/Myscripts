#MASTER YODA: Given a sentence, return a sentence with the words reversed

def reversestr(str1):
    word = str1.split()
    reverse = word[::-1]
    letsee = ' '.join(reverse)
    return letsee

output = reversestr('We are ready')

print(output)
