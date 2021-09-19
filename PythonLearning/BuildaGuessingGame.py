from Phone import *
#Building a game

Questions = [
     "What is your phone? \na)iphoneX \nb)iphone11",
     "Color of your phone? \na)Black 20 \nb)Blue"
]

questions = [Phone(Questions[0],"a"),
         Phone(Questions[1],"b")]

def guess(questions):
    score = 0
    for question in questions:
        answer = input(question.prompt)
        if answer == question.answer:
           score += 1
    print("You got it right")

guess(questions)