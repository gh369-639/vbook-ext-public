let BASE_URL = 'https://wattpad.com.vn';
try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {
}