#list comprehension of nested loops

mylist = [x*y for x in [0,2,4] for y in [1,5,7]]
print(f"{mylist}")


#Use List Comprehension to create a list of the first letters of every word in the string below:

st = "this is winter"

mylist = [x[0] for x in st.split()]
print(f"{mylist}")

