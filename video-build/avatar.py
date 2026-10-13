from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps
import numpy as np
SRC="/tmp/claude-0/-home-user-lifegoals-prototype/e92eea84-3aac-5c94-a947-7c36183afda4/images/2.png"
def make_head():
    im=Image.open(SRC).convert("RGB")
    st=im.filter(ImageFilter.UnsharpMask(radius=2,percent=120,threshold=2))
    st=ImageEnhance.Contrast(st).enhance(1.06)
    arr=np.array(im).astype(int)
    bgc=np.array([205,207,205])
    near=(np.abs(arr-bgc).sum(2)<45)
    outer=Image.new("L",im.size,0); ImageDraw.Draw(outer).ellipse((112,30,350,340),fill=255)
    inner=Image.new("L",im.size,0); ImageDraw.Draw(inner).ellipse((150,95,318,330),fill=255)
    outer=np.array(outer)>0; inner=np.array(inner)>0
    m=(outer & ~near) | inner
    ne=Image.new("L",im.size,0); ImageDraw.Draw(ne).rectangle((172,250,296,345),fill=255)
    m=m | (np.array(ne)>0)
    m=Image.fromarray((m*255).astype("uint8")).filter(ImageFilter.MedianFilter(7)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.6))
    box=(100,20,364,360)
    st=st.crop(box); m=m.crop(box)
    rgba=st.convert("RGBA"); rgba.putalpha(m)
    return rgba
if __name__=="__main__":
    h=make_head(); print(h.size)
    bg=Image.new("RGBA",h.size,(255,200,120,255)); bg.alpha_composite(h); bg.convert("RGB").resize((h.width*2,h.height*2)).save("head_test.png")
    a=np.array(Image.open(SRC).convert("RGB")); print("skin",a[250:280,150:200].reshape(-1,3).mean(0))
