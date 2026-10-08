from m2 import run
def solve(**k):
    lo,hi=0,20000
    for _ in range(40):
        m=(lo+hi)/2
        if run(extra_m=m,**k)['sf']>1: lo=m
        else: hi=m
    return hi
print("extra needed for full cover, no other lever")
for a in (50,55,60,65): print(a, round(solve(ret=a)))
print("with SP70% + PRSA redirect")
for a in (50,55,60,65): print(a, round(solve(ret=a,sp_wk=299.30,sp_pct=.7,pension='prsa')))
# actual-table deflation of baseline shortfall
sf=[11923,116760,121314,126045,130961,136068,141375,146889,152617,158570,164754,171179,177855,184791,191998,199486,207266,215350,223748,232474,241541,250961,260749,270918,281483,292461,299917]
ages=[54,55,56,57,58,59]+list(range(60,81))
inf=1.039
real=sum(s/inf**(a-27) for s,a in zip(sf,ages)); print("real(2027 money)",round(real), "len",len(sf),len(ages), sum(sf))
real26=sum(s/inf**(a-27+1) for s,a in zip(sf,ages)); print("real if base 2026",round(real26))
# PV at 27: discount 4.5% to 49, 3.15% after (age 27 -> 50 =23 yrs)
def disc(a): 
    t=a-27
    return (1.045)**min(t,23)*(1.0315)**max(t-23,0)
pv=sum(s/disc(a) for s,a in zip(sf,ages)); print("PV today lump sum (4.5% then 3.15%)",round(pv))
# PV at retirement of all needs 50..80 at 3.15%, and at 1.2%
nd=[40000*1.039**t for t in range(23,54)]
print("needs PV@50 3.15%",round(sum(n/1.0315**i for i,n in enumerate(nd))), " @1.2%",round(sum(n/1.012**i for i,n in enumerate(nd))))
print("pot 493k vs", 492908/sum(n/1.0315**i for i,n in enumerate(nd)))
print("pot in 2027 money", 492908/1.039**22, " 25x rule real need", 40000*30)
print("needs real total",40000*31)
# SP: weeks
print("SP annual",299.30*52, "monthly", 299.30*52/12)
# net pay check
it=44000*.2+(79000-44000)*.4-4000; usc=12012*.005+(28700-12012)*.02+(70044-28700)*.03+(79000-70044)*.08; prsi=79000*.043
print(it,usc,prsi,79000-it-usc-prsi)
print("net/mo",54383/12,"1850/net",1850/ (54383/12))
print("real net at 49",109951/1.039**22, "gross real at 49",79000*1.03**22/1.039**22)
