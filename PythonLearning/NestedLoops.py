#nested loops in list comprehensions

mylist = []

for x in [0,2,4]:
    for y in [1,5,7]:
        mylist.append(x*y)
print(f"{mylist}")

