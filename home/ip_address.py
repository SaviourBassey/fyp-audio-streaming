import subprocess


def get_ip():
    #Dsired IP address
    desired_ip = ""
    undesired_ip = ""

    # execute ifconfig command and capture output
    output = subprocess.check_output(["ifconfig"])

    # decode output as string
    output_str = output.decode("utf-8")

    # loop through output lines and extract information
    for line in output_str.split("\n"):
        if "inet " in line:
            # extract IP address from line
            ip_address = line.split()[1]
            print(ip_address)

            if ip_address != "127.0.0.1":
                desired_ip = ip_address
            elif ip_address == "127.0.0.1": 
                undesired_ip = ip_address  

    # Start the Django app on port 5000
    port = 5000
    if desired_ip and undesired_ip:
        return f"https://{desired_ip}:{port}/"
    elif desired_ip and not undesired_ip:
        return f"https://{desired_ip}:{port}/"
    elif undesired_ip and not desired_ip:
        return f"Please connect to a WIFI network"



#https://192.168.43.49:5000/