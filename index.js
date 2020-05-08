const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require("fs")
const { exec } = require('child_process');

function createWindow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 310,//310
    height: 400,//400
    frame: false,//窗口边框是否隐藏
    transparent: true,//窗口透明
    // backgroundColor: '#343a40',
    center: true,//Boolean (可选) - 窗口在屏幕居中.
    resizable: true,//Boolean (可选) - 窗口是否可以改变尺寸. 默认值为true.
    maximizable: false,//Boolean (可选) - 窗口是否可以最大化动. 在 Linux 中无效. 默认值为 true.
    skipTaskbar: false,//Boolean (可选) - 是否在任务栏中显示窗口. 默认值为false.
    icon: '../assets/Link_File.png',
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  // 并且为你的应用加载index.html
  win.loadFile('index.html')
  //远程
  // win.loadURL('http://localhost:8080/')

  // 打开开发者工具
  // win.webContents.openDevTools()
  // 在这个文件中，你可以续写应用剩下主进程代码。
  // 也可以拆分成几个文件，然后用 require 导入。
  //登录窗口最小化
  ipcMain.on('window-min', function () {
    win.minimize();
  })
  ipcMain.on('window-close', function () {
    win.close();
  })

  //文件拖拽完成监听
  ipcMain.on('file-message', (event, arg) => {
    console.log(arg) // prints "ping"
   



  })
  //Font替换覆盖
  ipcMain.on('cover-message', (event, arg) => {
    fs.writeFileSync(arg, fs.readFileSync('./font.lpk'));
    event.reply('cover-message-reply', 'ok')
  })

  //Font还原
  ipcMain.on('reduction-message', (event, arg) => {
    fs.writeFileSync(arg, fs.readFileSync('./copyFont.lpk'));
    event.reply('reduction-message-reply', 'ok')
  })

  //删除文件路径信息
  ipcMain.on('delete-file-message', (event,arg) => {
    console.log('arg',arg)
    fs.writeFileSync('./GamesInstallPath.config.js',`
    module.exports = {
      path:'',
      isSave:false
    }
    `)
  })
 //读取文件路径信息
 ipcMain.on('get-filer-message', (event) => {
  exec('reg query HKEY_CURRENT_USER\\Software\\Mail.ru\\GameCenter /z', (err, stdout) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(`stdout: ${stdout}`);
    
    
    var matchReg = /[a-zA-z]+:\\[^\s]*/;
    if(stdout.match(matchReg)){
      if(stdout.match(matchReg)[0]){
        stdout = stdout.match(matchReg)[0].replace('exe','ini')
          fs.readFile(stdout, 'UTF-16LE', (e, d) => {
            var matchRegA = /(?<=GamesInstallPath=)[a-zA-z]+:(\\.+)*/gi;
            var filePath = d.toString()
            filePath = filePath.match(matchRegA)[0] + 'LOSTARK\\EFGame\\font.lpk'
      
            //写入配置文件
            
            fs.writeFileSync('./GamesInstallPath.config.js',`
            module.exports = {
              path:${JSON.stringify(filePath)},
              isSave:true
            }
            `)
            //文件地址获取成功 filePath
            console.log(filePath)
            //复制此文件作为副本文件 
            fs.writeFileSync('./copyFont.lpk', fs.readFileSync(filePath));
      
      
            event.reply('filer-message-reply', filePath)
          })
      }
    }else{
      console.log('没有找到文件目录！')
      event.reply('error-reply', '没有找到文件目录！')
      
    }
    
  
  })
 
 
})

  
}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})



// In this file you can include the rest of your app's specific main process
// code. 也可以拆分成几个文件，然后用 require 导入。
