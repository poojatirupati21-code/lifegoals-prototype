import ctypes, wave, sys, numpy as np, espeakng_loader as e
lib = ctypes.CDLL(e.get_library_path())
CB = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
buf = []
def cb(w, n, ev):
    if w and n > 0: buf.extend(w[:n])
    return 0
cbf = CB(cb)
lib.espeak_Initialize.restype = ctypes.c_int
sr = lib.espeak_Initialize(2, 0, e.get_data_path().encode(), 0)
lib.espeak_SetSynthCallback(cbf)
def synth(text, path, voice=b"en-gb-x-rp", rate=150, pitch=48):
    buf.clear()
    lib.espeak_SetVoiceByName(voice)
    lib.espeak_SetParameter(1, rate, 0); lib.espeak_SetParameter(3, pitch, 0)
    t = text.encode()
    lib.espeak_Synth(t, len(t)+1, 0, 1, 0, 0x1000, None, None)
    lib.espeak_Synchronize()
    a = np.array(buf, dtype=np.int16)
    with wave.open(path, 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr); f.writeframes(a.tobytes())
    return len(a)/sr
if __name__ == "__main__":
    print(synth("Aoife and Conor have been renting in Dublin for four years.", "t.wav"))
