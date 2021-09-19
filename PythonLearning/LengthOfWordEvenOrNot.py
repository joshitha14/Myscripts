#Go through the string below and if the length of a word is even print "even!"

st = 'Hi how are you'

for letter in st.split():
    if len(letter) % 2 == 0:
        print(f"{letter} is even")