"""Illustrative replica of the LifeMap engine, calibrated to the PDF baseline (9% cover, first gap age 54, pot at 49 ~ EUR 493k).
Two pots: S (accessible savings, blended 2.7% working / 1.2% retired) and P (pension, 4.5% working / 3.15% retired, locked until 60).
All figures nominal unless stated. Year t=0 is 2027 / age 27, as the PDF does."""
import sys
INFL=0.039; PAY=0.03
def pay(t): return 79000*(1+PAY)**t
def run(ret=50, spend=40000, infl=INFL, end=80, c0=12200, cg=0.03, goal=17000,
        extra_m=0.0, extra_r=0.045, extra_g=None,        # extra saving, invested at 4.5%, escalating with inflation
        sp_wk=0.0, sp_pct=1.0, sp_age=66,                  # state pension (today's money, indexed with prices)
        pension=None,  # None | 'prsa' (redirect saving, grossed up at 40% relief, age-limited) | 'ae' (auto-enrol 1.5+1.5+0.5%)
        rS_w=0.027, rS_r=0.012, rP_w=0.045, rP_r=0.0315, arf_tax=0.15, access=60):
    if extra_g is None: extra_g=infl
    S=0.0;P=0.0;E=0.0  # E: extra-savings pot (accessible) treated as part of S but grown at extra_r while working
    funded=need_tot=sf=real=pvpot=0;first=None;yrs=0;fy=0; cap_at_ret=None
    flows=[]
    for t in range(end-27+1):
        age=27+t
        if age<ret:
            net=c0*(1+cg)**t
            if pension=='prsa':
                lim=(0.15 if age<30 else 0.20 if age<40 else 0.25 if age<50 else 0.30)*min(pay(t),115000)
                gross=min(net/0.6,lim); cost=gross*0.6; P=P*(1+rP_w)+gross; net-=cost
            elif pension=='ae':
                emp=0.015*min(pay(t),80000*1.039**t); P=P*(1+rP_w)+emp*(1+1+1/3); net-=emp   # employer 1:1, State 1 per 3 paid in
            else: P=P*(1+rP_w)
            S=S*(1+rS_w)+net-(goal if t==3 else 0)
            E=E*(1+extra_r)+extra_m*12*(1+extra_g)**t
            S=max(S,0)
        else:
            if cap_at_ret is None: cap_at_ret=S+E+P
            if age==ret: S+=E; E=0
            need=spend*(1+infl)**t
            sp=sp_wk*52*(1+infl)**t*sp_pct if age>=sp_age else 0
            S*=1+rS_r; P*=1+rP_r
            if age==access and ret<=access: S+=0 # lump handled below
            if age==max(access,ret): lump=0.25*P; S+=lump; P-=lump   # 25% tax-free lump (<=200k), rest to ARF
            has_arf = P>0 or pension is not None
            tax=arf_tax if has_arf else 0.05
            sp_net=sp*(1-tax)
            n=max(need-sp_net,0); used_sp=min(sp_net,need)
            d=min(S,n); S-=d; n-=d
            if n>0 and age>=max(access,ret) and P>0:
                g=min(P,n/(1-arf_tax)); P-=g; d+=g*(1-arf_tax); n-=g*(1-arf_tax)
            f=used_sp+d; funded+=f; need_tot+=need
            if need-f>0.5:
                first=first or age; yrs+=1; sf+=need-f; real+=(need-f)/(1+infl)**t
    return dict(cov=funded/need_tot,first=first,yrs=yrs,sf=sf,real=real,cap=cap_at_ret,need=need_tot,fy=(end-ret+1-yrs))
if __name__=="__main__":
    print(run())
