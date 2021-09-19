#return employee of the month

work_hours = [('viaan',200),('mo',1500),('jo',100)]
def employee_hours(work_hours):
    current_max = 0
    employee_of_month = ''

    for employee,hours in work_hours:
        if hours > current_max:
            current_max = hours
            employee_of_month = employee
        else:
            pass

    return(employee_of_month,current_max)

result = employee_hours(work_hours)

print(result)