import json, wave, numpy as np
from tts import synth, sr
from script import SCENES
GAP=0.3; SCGAP=0.5
out=[]; t=0.0; timing=[]
for si,sc in enumerate(SCENES):
    st=[]
    for k,(say,cap) in enumerate(sc["sent"]):
        p=f"a_{si}_{k}.wav"; d=synth(say,p,rate=176,pitch=50)
        a=np.frombuffer(wave.open(p,'rb').readframes(10**9),dtype=np.int16)
        st.append((t,t+d,cap)); out.append(a); t+=d
        g=GAP if k<len(sc["sent"])-1 else SCGAP
        out.append(np.zeros(int(g*sr),dtype=np.int16)); t+=g
    timing.append(dict(id=sc["id"],start=st[0][0],end=t,sent=st))
a=np.concatenate(out); 
with wave.open("voice.wav","wb") as f:
    f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes(a.tobytes())
json.dump(dict(total=t,scenes=timing),open("timing.json","w"),indent=1)
print("total",round(t,1),"s")
