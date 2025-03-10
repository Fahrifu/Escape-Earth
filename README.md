# Escape from Earth
This is a challenge similar to the Pokemon challenge we did in class https://bit.ly/scavenger25

# Background
You are part of a rogue space exploration team, working in the shadows of the solar system’s largest corporations, Yspace and Green Terminous, owned and operated by the 1% plutocrats that have poisoned our world. Your intelligence work has identified that these two companies are colluding and have built a deep space vault, hidden on the far side of Pluto, that holds classified data about the solar system’s planets and moons—information that could change everything we know about space travel.

The resistance has decided that it is imperative that you infiltrate the companies by hacking into their data centers and extracting critical data before your ship runs out of power. Work fast, work smart, and don’t trip the alarms—or risk being stranded in the void forever.

# Technical details and limitations
The corporation system can be accessed using this API:

https://api.le-systeme-solaire.net/en/Links to an external site.

Get your orders and evaluate your progress with the resistance infiltration system (RIS).

RIS is available at https://spacescavanger.onrender.com/Links to an external site.

There are two endpoints to our resistance system:

# Endpoint: /start
Method: GET
Requires: Query parameter player, the value of player MUST be your student email.
# Endpoint: /answer
Method: POST
Requires: Body with the format: {answer, player} (rember to set content type to the correct content type)
Use the vetted library node-fetchLinks to an external site. for all communication.

The RIS system is watching you and keeping an up-to-date ranking list of you and other agents. Only the top 15 will be honored with a place in our history books.

Once you have gained access to the deep-space vault, you will be given a skeleton key. You are our single greatest last hope.

# Submit
URL to GitHub repository with your code.

The code should show all the steps you had to take to find the answers (i.e., show your work, and we should be able to run your code and get the skeleton key).
Comments are allowed in order to clearify reasoning if you want to

The repository should also include a file skeletonkey.txt with the key you found (the key will be unique to you).