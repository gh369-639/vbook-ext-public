load("config.js");
function execute(key, page) {
  if (!page) page = '1';
  let payload = [
    'rsz=20',
    'num=20',
    'hl=vi',
    'source=gcsc',
    'cselibv=6467658b9628de43',
    'cx=7b917725a0db8f5bb',
    'q=' + encodeURIComponent(key),
    'safe=off',
    'cse_tok=AEXjvhL-rHVg5r6Y5fvvECm3XJga%3A1758865654619',
    'lr=',
    'cr=',
    'gl=',
    'filter=0',
    'sort=',
    'as_oq=sex',
    'as_sitesearch=',
    'exp=cc%2Capo',
    'oq=' + encodeURIComponent(key),
    'gs_l=partner-generic.12...22433.25138.0.34855.46.21.0.0.0.1.190.1878.12j9.21.0.csems%2Cnrl%3D10...0....1.34.partner-generic..46.0.0.7rVL93cRym8',
    'callback=google.search.cse.api9418',
    'rurl=https%3A%2F%2Ftruyensextv99.com%2Ftim-kiem%2F%23gsc.tab%3D0',
    'start=' + ((page-1)*20)
  ].join('&');
  let url = 'https://cse.google.com/cse/element/v1?' + payload;
  let response = fetch(url);
  let data = [];
  if (response.ok) {
    // Kết quả trả về là một chuỗi dạng: google.search.cse.api9418({...})
    let text = response.text();
    // Loại bỏ callback, chỉ lấy phần JSON bên trong
    let start = text.indexOf('(');
    let end = text.lastIndexOf(')');
    if (start !== -1 && end !== -1) {
        let jsonText = text.substring(start + 1, end);
        let obj = JSON.parse(jsonText);
        //console.log(jsonText);
        if (obj.results && obj.results.length > 0) {
          obj.results.forEach(e => {
            data.push({
              "name": e.titleNoFormatting || '',
              "link": e.url || '',
              "description": e.contentNoFormatting || '',
              "host": (e.visibleUrl && !/^https?:\/\//i.test(e.visibleUrl) ? 'https://' + e.visibleUrl : e.visibleUrl) || ''
            });
          });
        }
        return Response.success(data);
    }
  }
  return null;
}