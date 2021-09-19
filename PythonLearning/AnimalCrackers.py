#ANIMAL CRACKERS: Write a function takes a two-word string and returns True if both words begin with same letter

def animal_crackers(text):
    words = text.lower().split()
    if words[0][0] == words[1][0]:
        return True
    else:
        return False

test = animal_crackers('Hi How')

print(test)
