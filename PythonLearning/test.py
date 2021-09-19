



n = 20
if(n % 2) == 0:
    print(f"{n} is an even number")
else:
    print('It is an odd number')
sorted = ['9','2','6','3', '9', '7', '1']
sorted.sort()
print(f"sorted {sorted}")
sorted.append("5")
print(f"{sorted}")
pop = sorted.pop(0)
print(f"{pop}")
f = sorted[0]
print(f"{f}")
g = sorted[::]
print(f"{g}")
sorted[4] = '4'
print(f"{sorted}")
if(6 != 6) and ('5' == '5'):
    print("T")
else:
    print("F")
waste = 'trash'
if waste == 'trash':
    print("throw it in plastic")
elif waste == 'compost':
    print("throw it in compost")
elif waste == 'bottle':
    print('throw it in trash')
else:
    print('throw it in Foodstruck')
#list
items = [1,3,4,6]
for num in items:
    if (num % 2) == 0:
        print(num)
    else:
        print(f" Odd number {num} ")
#strings
cake = 'vanilla'
vowels = set("aeiou")
for char in cake:
    if char in vowels:
        print("Vowels")
    else:
        print('Non vowels')
#tuples
mylist = [(1,2,8),(4,3,6)]
for a,b,c in mylist:
    print(b)

#dictionaries
mykeys = {'k1':1, 'k2':3, 'K4':5}
for Keys,values in mykeys.items():
    print(values)

#while loop

x = 0

while x < 3:
    if x == 1:
        break #break: breaks out of the current closest enclosing loop;
        # continue: Goes to the top of the closest enclosing loop
        # pass does nothing at all
    print(x)
    x += 1

#range

for num in range(0,10):
    print(num)

v = {'key':'aeoi'}
for (Key) in cake:
    print("vowels")

#to get the index value of any item, you can use enumerate or zip

word = 'abcde'

for item in enumerate(word):
    print(item)

#zip items


#list comprehensions in Python

mylist = [x for x in range(0,10)]
print(f"{mylist}")

#grab only even numbers and square the numbers

mylist = [num**2 for num in range(0,20) if num%2 == 0]
print(f"{mylist}")


#append or pop

gett = ['1','2', '3']

gett.append('4')
gett.pop()
print(f"{gett}")

#help to get to know about method

help(gett.insert)

gett.insert(1, '6')
print(f"{gett}")

#functions

def add_number(num1, num2):
    return num1+num2

result = add_number(1,2)
print(f"{result}")

#check if num is even or not

def even_num(num1):
    return (num1 % 2)==0

result = even_num(69)
print(f"{result}")

#return true if any number is even inside a list


def even_checker(num1):
    for number in num1:
        if (number % 2) == 0:
            return True
        else:
            pass

#return even number list

def even_checker(number1):

    even_list = []

    for number in number1:
        if (number%2) == 0:
            even_list.append(number)
        else:
            pass
    return even_list

#tuples unpacking

mytuple = [('viaan',1),('mo',31),('jo',30)]
for name,age in mytuple:
    print(age * (age + 30))



find_numbers = [1, 9, 5, 2, 6]
def greater(find_numbers):
    max_number = 0

    for numb in find_numbers:
        if numb > max_number:
            max_number = numb
        else:
            pass
    return(max_number)

result = greater(find_numbers)

print(result)

#*args

def myfunc(*args):
    return sum(args)*0.2



resu = myfunc(10,20,30,40,50)

print(resu)

#kwargs: Keyword arguments

def myfunct(*args, **kwargs):
    for fruit in kwargs:
        print("My fav fruit is {}".format(args[0],kwargs[fruit]))

re = myfunct(1,2,fruit='apple')

print(re)

#warmup

def lesser_of_two(a,b):
    if a%2==0 and b%2==0:
        return min(a,b)
    else:
        return max(a,b)

r = lesser_of_two(2,9)

print(r)








#ALMOST THERE: Given an integer n, return True if n is within 10 of either 100 or 200

def almost_there(n):
   return (abs(100-n) <= 10) or (abs(200-n) <= 10)

output = almost_there(81)

print(output)

#Given a list of ints, return True if the array contains a 3 next to a 3 somewhere.

def has_33(nums):
    for i in range(0,len(nums)-1):
        if nums[i]==3 and nums[i+1]==3:
            return True
    return False
#if num[i:i+2] == [3,3]
output = has_33([1,3,3])

print(output)





def hi(name,age):
    print("Hello " + name + " I am " + str(age))

hi("viaan", 2)
hi("Mo", 31)

def cubethree(numb):
    return numb*numb*numb

print(cubethree(2))

is_username = False
is_password = True

if is_username and is_password:
    print("login successful")
elif is_username and not(is_password):
    print("login")
elif not(is_username) and is_password:
    print("no username")
else:
    print("login unsuccessful")



#biggest number

def bignum(a,b,c):
    if a >= b and a >= c:
        return a
    elif b >= a and b >= c:
        return b
    else:
        return c

result = (bignum(5, 2, 10))

print(result)


#calculator

num1 = float(input("Enter 1st num:"))
op = input("Enter op:")
num2 = float(input("Enter 2nd num:"))

if op == "+" :
    print (num1 + num2)
elif op == "-":
    print(num1 - num2)
else:
    print("Invalid")


#dictionaries

diction = {"Nov": "November", "Dec": "December"}
print(diction["Nov"])
print(diction.get("Jan", "Not a valid"))


#while loop

i = 1
while i <= 10:
    print(i)
    i +=2

print("Done with the loop")



#login password

login = "Jo"
password = "Viaan"
logininput = ""
loginpassword = ""
count = 0
limit = 2
guesses = False

while loginpassword != password and not(guesses):
    if count < limit:
        loginpassword = input("Enter password")
        count +=1
    else:
        guesses = True

if guesses:
    print("You dont have enough chances")
else:
    print("login successful")


#PAPER DOLL: Given a string, return a string where for every character in the original there are three characters¶


def three(name):
    storing = ""
    for item in name:
        storing += item*3
    return storing

print(three("Hello"))


#for loop

Array = ["Jim", "Kevin", "Matt"]

for index in Array:
    if index == 0:
        print("Not successful")
    else:
        print("Not")



print(translator(input("Enter a phrase")))



#writing files





