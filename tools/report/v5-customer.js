window.mkV5 = function(){ S = fresh(); Object.assign(S.ans, {'2':2,'4':3,'7':0,'9':2,'12':3}); S.um = S.um || {}; S.um.a = S.um.a || {}; S.um.a.u14 = 2;   /* The Explorer; 3 to 6 months of savings (your answer); risk appetite not answered */ S.about = {age:27, partner:false, deps:0, married:null}; S.acct.name='Pooja';
 const put=(k,v)=>{S.fin[k]=v;S.src[k]='typed'};
 put('work','Employed');put('income',79000);put('costsM',3000);put('home','Rent');
 S.goals=[]; const g1=mkGoal('family'); g1.age=30; g1.amount=15000; S.goals.push(g1); const g2=mkGoal('retire'); g2.amount=40000; S.goals.push(g2);
 ['life','health'].forEach(k=>put(k,'Yes')); ['ip','ci','workCover'].forEach(k=>put(k,'No')); prefillAbout(); S.retireSet=true; setRetireAge(50); g2.age=50; S.asm.startYear=2026; S.asm.spWeek=0; S.ans['6']=3; S.fin.ae='No'; S.src.ae='typed'; S.about.cred={rent:true}; S.asm.planEnd=80; S.infl=0.039; S.shell=true; S.app=true; applyAssume(); return S; };
