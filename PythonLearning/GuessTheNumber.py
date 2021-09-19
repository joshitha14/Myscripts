from random import *

#Guess the number: you should use random module


def guess(x):
    random_numb = random.randit(1,x)
    guess_count = 0
    while guess_count != random_numb:
            guess_count = int(input(f"Guess number between 1 and {x}:"))
            if guess >random_numb:
                print("Too high")
            elif guess < random_numb:
                print("Too low")
    print(f"you got the {random_numb} right")

guess(10)
