import uno, json, time, subprocess, os
from com.sun.star.beans import PropertyValue
import openpyxl

class XL:
    def __init__(self, path, port=2002):
        self.path = path
        ctx = uno.getComponentContext(); res = ctx.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", ctx)
        for _ in range(40):
            try:
                c = res.resolve(f"uno:socket,host=localhost,port={port};urp;StarOffice.ComponentContext"); break
            except Exception: time.sleep(0.5)
        self.desk = c.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", c)
        p = PropertyValue(); p.Name = "Hidden"; p.Value = True
        self.doc = self.desk.loadComponentFromURL("file://" + path, "_blank", 0, (p,))
        wb = openpyxl.load_workbook(path)
        self.names = {n: wb.defined_names[n].attr_text for n in wb.defined_names}
        mp = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'plan-meta.json')
        self.meta = json.load(open(mp)) if os.path.exists(mp) else {}
        self.touched = []
    def sh(self, name): return self.doc.Sheets.getByName(name)
    def locate(self, name):
        ref = self.names[name]; sheet, cell = ref.rsplit('!', 1); sheet = sheet.strip("'"); return sheet, cell.replace('$', '')
    def cell(self, name):
        sheet, cell = self.locate(name); return self.sh(sheet).getCellRangeByName(cell)
    def set(self, sheet, addr, v):
        c = self.sh(sheet).getCellRangeByName(addr)
        if v is None: c.setFormula('')
        elif isinstance(v, str): c.setString(v)
        else: c.setValue(float(v))
        self.touched.append((sheet, addr))
    def setname(self, name, v, col=None):
        sheet, cell = self.locate(name)
        if col:  # the typed (yellow) cell sits in column C of the same row as the used cell G
            import re; row = re.search(r'\d+', cell).group(0); cell = f'{col}{row}'
        self.set(sheet, cell, v)
    def clear(self):
        for sheet, addr in self.touched: self.sh(sheet).getCellRangeByName(addr).setFormula('')
        self.touched = []
    def calc(self): self.doc.calculateAll()
    def val(self, name):
        c = self.cell(name)
        if c.getError(): return '#ERR%d' % c.getError()
        t = c.Type.value
        return c.getString() if (t == 'TEXT' or (t == 'FORMULA' and c.FormulaResultType2 == 2)) else c.getValue()
    def getcell(self, sheet, addr):
        c = self.sh(sheet).getCellRangeByName(addr)
        if c.getError(): return '#ERR%d' % c.getError()
        if c.Type.value == 'EMPTY': return None
        if c.Type.value == 'TEXT' or (c.Type.value == 'FORMULA' and c.FormulaResultType2 == 2): return c.getString()
        return c.getValue()
    def close(self): self.doc.close(True)
