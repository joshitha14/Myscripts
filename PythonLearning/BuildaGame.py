#Build a game
guessname = "Success"
guess = ""
count = 0
limit = 3
out_of = False

while guess != guessname and not(out_of):
    if count < limit:
        guess = input("Enter the word")
        count +=1
    else:
        out_of = True

if out_of:
    print("You lost")
else:
    print("You win")