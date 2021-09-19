#OLD MACDONALD: Write a function that capitalizes the first and fourth letters of a name

def old_macdonald(nr):
    first = nr[0]
    inbetween = nr[1:3]
    fourth = nr[3]
    remaining = nr[4:]
    return first.upper() + inbetween + fourth.upper() + remaining


output = old_macdonald('joshitha')

print(output)