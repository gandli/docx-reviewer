# 测试文件样例

这组文件用于导入、原样预览和格式兼容测试，内容主题保持一致，便于不同格式之间对照。

## 重新生成

```bash
uv run --with openpyxl --with reportlab --with xlwt python scripts/generate-test-documents.py
```

## 文件列表

- `sample-procurement-spec.doc`
- `sample-procurement-spec.docx`
- `sample-procurement-spec.pdf`
- `sample-procurement-spec.md`
- `sample-procurement-spec.txt`
- `sample-procurement-spec.xls`
- `sample-procurement-spec.xlsx`

## 内容主题

统一使用“办公设备升级采购需求说明书”这一主题，包含：

- 项目背景
- 采购目标
- 预算与付款建议
- 简单表格
