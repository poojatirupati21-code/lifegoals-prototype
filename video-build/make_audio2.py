import json, numpy as np, soundfile as sf, re
from kokoro_onnx import Kokoro
from script2 import SCENES
K="/tmp/claude-0/-home-user-lifegoals-prototype/e92eea84-3aac-5c94-a947-7c36183afda4/scratchpad/k/"
k=Kokoro(K+"kokoro.onnx",K+"voices.bin"); SR=24000
GAP=0.28; SCGAP=0.45
out=[]; t=0.0; timing=[]
for sc in SCENES:
    st=[]
    for i,(say,cap) in enumerate(sc["sent"]):
        a,sr=k.create(say,voice="bm_george",speed=1.04,lang="en-gb"); assert sr==SR
        a=a.astype(np.float32)
        # trim leading/trailing silence
        nz=np.where(np.abs(a)>0.01)[0]; a=a[nz[0]:nz[-1]+1]
        d=len(a)/SR; st.append((t,t+d,cap)); out.append(a); t+=d
        g=GAP if i<len(sc["sent"])-1 else SCGAP
        out.append(np.zeros(int(g*SR),dtype=np.float32)); t+=g
    timing.append(dict(id=sc["id"],start=st[0][0],end=t,sent=st))
a=np.concatenate(out); sf.write("voice2.wav",a,SR)
np.save("voice2.npy",a)
json.dump(dict(total=t,scenes=timing),open("timing2.json","w"),indent=1)
print("total",round(t,1))
