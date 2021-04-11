# git中的HEAD是什么

### 问题来源

git 恢复文件到初始状态的命令：



```ruby
$ git reset HEAD <file>
```

git 展示提交日志命令：



```bash
$ git log
commit c4f9d71863ab78cfca754c78e9f0f2bf66a2bd77 (HEAD -> master)
```

在这些命令中常常会看到`HEAD`这个名词，它指的是什么呢？

### 回答

这要从git的分支说起，git 中的分支，其实本质上仅仅是个指向 commit 对象的可变指针。git 是如何知道你当前在哪个分支上工作的呢？
 其实答案也很简单，它保存着一个名为 HEAD 的特别指针。在 git 中，它是一个指向你正在工作中的本地分支的指针，可以将 HEAD 想象为当前分支的别名。