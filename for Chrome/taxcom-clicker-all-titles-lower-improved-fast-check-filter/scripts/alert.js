/** подменяю дефолтную функцию alert - чтобы не останавливала выполнение скрипта */
window.alert = function alert (message) {
    console.log (message);
}