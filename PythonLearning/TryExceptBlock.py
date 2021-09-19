#tryexcept block

try:
    value = 100/0
    num = int(input("Enter: "))
    print(num)
except ZeroDivisionError as err:
    print(err)
except ValueError as val:
    print(val)