from Phone import *
from Student import *
#Classes and objects: They make the code organized. Using classes and objects you can define your own data type, becuase in real word
#data cannot be coming into the category of strings, numbers or booleans. So with classes, you can define your own data type

phone1 = Phone("iphoneX", "black")
print(phone1.model)

#Class function can be used inside of a class, you can either modify the objects of that class or give us specific information about those objects

student1 = Student("Jo", "CS", 2.3)
student2 = Student("Mo", "EC", 3.4)

print(student1.honors())
