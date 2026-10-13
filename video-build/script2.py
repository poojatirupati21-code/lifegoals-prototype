# Instagram-reel script: host = LifeGoals mortgage guide (photo face), story = Aoife & Conor.
# (say = what the voice reads, cap = on-screen caption)
def S(t, say=None): return (say or t, t)
SCENES = [
 dict(id="hook", bg=((94,84,142),(20,16,50)), label="", sent=[
  S("Buying your first home in Ireland? Stop. I almost made a costly mistake, so watch this before you sign anything."),
  S("I fell in love with a house. Then the questions hit."),
  S("Can I afford it? What's the catch? What am I missing?"),
  S("So I did my homework. Here are seven things every first time buyer must know."),
 ]),
 dict(id="t1", bg=((24,100,108),(10,40,46)), label="1  KNOW YOUR REAL BUDGET", sent=[
  S("One. Know your real budget."),
  S("Central Bank rules let first time buyers borrow up to four times their income, with a ten percent deposit."),
  S("But the maximum isn't the goal. Choose the repayment you can sleep on."),
 ]),
 dict(id="t2", bg=((200,90,70),(80,30,40)), label="2  THE DEPOSIT ISN'T ALL", sent=[
  S("Two. The deposit is not the only cheque."),
  S("Add stamp duty, legal fees, a survey and insurance. Plan for several thousand euro extra."),
 ]),
 dict(id="t3", bg=((46,158,140),(14,60,64)), label="3  CLAIM EVERY BENEFIT", sent=[
  S("Three. Claim every benefit you qualify for."),
  S("Help to Buy refunds income tax and D.I.R.T., up to thirty thousand euro, on a new build.", "Help to Buy refunds income tax and DIRT, up to €30,000, on a new build."),
  S("The First Home Scheme is shared equity, up to thirty percent of a new home.", "The First Home Scheme is shared equity, up to 30% of a new home."),
  S("The Local Authority Home Loan is there if a bank says no."),
  S("And grants exist to bring vacant homes back to life."),
 ]),
 dict(id="t4", bg=((78,155,216),(20,50,100)), label="4  PICK THE RIGHT MORTGAGE", sent=[
  S("Four. Pick the right mortgage."),
  S("Fixed rates give certainty. Variable rates can move."),
  S("Green mortgages are cheaper for energy efficient homes."),
  S("A longer term lowers the monthly payment, but you pay more interest overall."),
 ]),
 dict(id="t5", bg=((94,84,142),(30,24,70)), label="5  GET APPROVAL IN PRINCIPLE", sent=[
  S("Five. Get approval in principle first."),
  S("Lenders study your savings habits, your Central Credit Register record, and your debts."),
  S("So for months before applying, pay on time and avoid new loans."),
 ]),
 dict(id="t6", bg=((217,144,26),(110,60,20)), label="6  CHECK THE HOUSE", sent=[
  S("Six. Do your homework on the house."),
  S("Hire a solicitor you trust, get a survey, and check the B E R rating, because energy bills are part of your real cost.", "Hire a solicitor you trust, get a survey, and check the BER rating, because energy bills are part of your real cost."),
 ]),
 dict(id="t7", bg=((31,122,107),(10,40,50)), label="7  PROTECT YOUR FAMILY", sent=[
  S("Seven. Protect your family."),
  S("Mortgage protection is required, and an emergency fund covers the tough month."),
  S("Ask yourself: what if rates rise, or one income stops?"),
 ]),
 dict(id="road", bg=((20,16,50),(60,50,110)), label="HOW YOU GET THE KEYS", sent=[
  S("So how do you actually get the keys?"),
  S("Save. Get approval. Find your home. Agree the sale. Receive the loan offer. Sign with your solicitor. Draw down. Collect your keys."),
 ]),
 dict(id="end", bg=((255,176,32),(232,103,74)), label="", sent=[
  S("I followed these steps. Eight months later, the keys were in my hands."),
 ]),
 dict(id="solution", bg=((14,47,51),(24,100,108)), label="LIFEGOALS", sent=[
  S("LifeGoals brings it all together. Your goals on a timeline, simple learning, and a verified mortgage expert beside you."),
 ]),
 dict(id="cta", bg=((94,84,142),(232,103,74)), label="", sent=[
  S("Save this video, share it with someone buying their first home, and start your plan on LifeGoals."),
 ]),
]
