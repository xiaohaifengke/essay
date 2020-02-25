> 删除.git文件夹可能会导致git存储库中的问题。如果要删除所有提交历史记录，但将代码保持在当前状态，可以按照以下方式安全地执行此操作：

1. 尝试 运行 git checkout --orphan latest_branch
2. 添加所有文件git add -A
3. 提交更改git commit -am "commit message"
4. 删除分支git branch -D master
5. 将当前分支重命名git branch -m master
6. 最后，强制更新存储库。git push -f origin master
