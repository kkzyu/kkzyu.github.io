import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import mysql.connector # 仅在 MySQL 方案中需要

app = Flask(__name__)
CORS(app) # 允许所有来源的跨域请求，生产环境应配置更严格的规则

# --- 方案一：使用内存变量存储评论 ---
comments_store = []
next_comment_id = 1

# --- 方案二：(可选) MySQL 数据库配置 ---
# MYSQL_CONFIG = {
#     'user': 'your_db_user',
#     'password': 'your_db_password',
#     'host': 'localhost', # 或你的数据库服务器地址
#     'database': 'your_database_name',
#     'raise_on_warnings': True
# }

# def get_db_connection():
#     """获取数据库连接"""
#     try:
#         conn = mysql.connector.connect(**MYSQL_CONFIG)
#         return conn
#     except mysql.connector.Error as err:
#         print(f"Error connecting to MySQL: {err}")
#         return None

# def init_db():
#     """初始化数据库表 (如果不存在)"""
#     conn = get_db_connection()
#     if conn:
#         cursor = conn.cursor()
#         try:
#             cursor.execute("""
#                 CREATE TABLE IF NOT EXISTS comments (
#                     id INT AUTO_INCREMENT PRIMARY KEY,
#                     nickname VARCHAR(100) NOT NULL,
#                     content TEXT NOT NULL,
#                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
#                 )
#             """)
#             print("Comments table checked/created successfully.")
#         except mysql.connector.Error as err:
#             print(f"Error creating table: {err}")
#         finally:
#             cursor.close()
#             conn.close()

# init_db() # 应用启动时检查/创建表

# --- API Endpoints ---

@app.route('/api/comments', methods=['GET'])
def get_comments():
    """获取所有评论"""
    # --- 内存方案 ---
    sorted_comments = sorted(comments_store, key=lambda c: c['id'], reverse=True) # 按 ID 降序（最新在前）
    return jsonify(sorted_comments)

    # --- MySQL 方案 ---
    # conn = get_db_connection()
    # if not conn:
    #     return jsonify({"error": "Database connection failed"}), 500
    # cursor = conn.cursor(dictionary=True) # 返回字典形式的结果
    # try:
    #     cursor.execute("SELECT id, nickname, content, created_at, updated_at FROM comments ORDER BY created_at DESC")
    #     comments = cursor.fetchall()
    #     # 转换 datetime 对象为字符串，以便 JSON 序列化
    #     for comment in comments:
    #         comment['created_at'] = comment['created_at'].isoformat() if comment.get('created_at') else None
    #         comment['updated_at'] = comment['updated_at'].isoformat() if comment.get('updated_at') else None
    #     return jsonify(comments)
    # except mysql.connector.Error as err:
    #     print(f"Error fetching comments: {err}")
    #     return jsonify({"error": "Failed to fetch comments"}), 500
    # finally:
    #     cursor.close()
    #     conn.close()

@app.route('/api/comments', methods=['POST'])
def add_comment():
    """添加新评论"""
    global next_comment_id
    data = request.json
    nickname = data.get('nickname', '匿名用户') # 默认匿名
    email = data.get('email', 'unknown@unknown.com') # 默认匿名
    content = data.get('content')

    if not content:
        return jsonify({"error": "Comment content cannot be empty"}), 400

    # --- 内存方案 ---
    new_comment = {
        "id": next_comment_id,
        "nickname": nickname,
        "email": email,
        "content": content,
        "created_at": datetime.datetime.now().isoformat() # 使用 ISO 格式字符串
    }
    comments_store.append(new_comment)
    next_comment_id += 1
    return jsonify(new_comment), 201 # 201 Created

    # --- MySQL 方案 ---
    # conn = get_db_connection()
    # if not conn:
    #     return jsonify({"error": "Database connection failed"}), 500
    # cursor = conn.cursor()
    # try:
    #     sql = "INSERT INTO comments (nickname, content) VALUES (%s, %s)"
    #     val = (nickname, content)
    #     cursor.execute(sql, val)
    #     conn.commit()
    #     comment_id = cursor.lastrowid # 获取新插入行的 ID
    #     # 查询刚插入的数据返回给前端
    #     cursor.execute("SELECT id, nickname, content, created_at, updated_at FROM comments WHERE id = %s", (comment_id,))
    #     new_comment = cursor.fetchone()
    #     if new_comment:
    #          # 转换 datetime 对象为字符串
    #         new_comment_dict = dict(zip(cursor.column_names, new_comment)) # 转换为字典
    #         new_comment_dict['created_at'] = new_comment_dict['created_at'].isoformat() if new_comment_dict.get('created_at') else None
    #         new_comment_dict['updated_at'] = new_comment_dict['updated_at'].isoformat() if new_comment_dict.get('updated_at') else None
    #         return jsonify(new_comment_dict), 201
    #     else:
    #         return jsonify({"error": "Failed to retrieve newly added comment"}), 500
    # except mysql.connector.Error as err:
    #     conn.rollback() # 出错时回滚
    #     print(f"Error adding comment: {err}")
    #     return jsonify({"error": "Failed to add comment"}), 500
    # finally:
    #     cursor.close()
    #     conn.close()


@app.route('/api/comments/<int:comment_id>', methods=['PUT'])
def update_comment(comment_id):
    """更新指定 ID 的评论"""
    data = request.json
    new_content = data.get('content')

    if not new_content:
        return jsonify({"error": "Comment content cannot be empty"}), 400

    # --- 内存方案 ---
    comment_to_update = None
    for comment in comments_store:
        if comment['id'] == comment_id:
            comment_to_update = comment
            break

    if comment_to_update:
        comment_to_update['content'] = new_content
        comment_to_update['updated_at'] = datetime.datetime.now().isoformat() # 更新时间戳
        return jsonify(comment_to_update)
    else:
        return jsonify({"error": "Comment not found"}), 404

    # --- MySQL 方案 ---
    # conn = get_db_connection()
    # if not conn:
    #     return jsonify({"error": "Database connection failed"}), 500
    # cursor = conn.cursor()
    # try:
    #     # 检查评论是否存在
    #     cursor.execute("SELECT id FROM comments WHERE id = %s", (comment_id,))
    #     existing_comment = cursor.fetchone()
    #     if not existing_comment:
    #         return jsonify({"error": "Comment not found"}), 404

    #     # 更新评论
    #     sql = "UPDATE comments SET content = %s WHERE id = %s"
    #     val = (new_content, comment_id)
    #     cursor.execute(sql, val)
    #     conn.commit()

    #     # 查询更新后的数据返回给前端
    #     cursor.execute("SELECT id, nickname, content, created_at, updated_at FROM comments WHERE id = %s", (comment_id,))
    #     updated_comment = cursor.fetchone()
    #     if updated_comment:
    #         updated_comment_dict = dict(zip(cursor.column_names, updated_comment))
    #         updated_comment_dict['created_at'] = updated_comment_dict['created_at'].isoformat() if updated_comment_dict.get('created_at') else None
    #         updated_comment_dict['updated_at'] = updated_comment_dict['updated_at'].isoformat() if updated_comment_dict.get('updated_at') else None
    #         return jsonify(updated_comment_dict)
    #     else:
    #          return jsonify({"error": "Failed to retrieve updated comment"}), 500 # 理论上不应该发生

    # except mysql.connector.Error as err:
    #     conn.rollback()
    #     print(f"Error updating comment: {err}")
    #     return jsonify({"error": "Failed to update comment"}), 500
    # finally:
    #     cursor.close()
    #     conn.close()

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    """删除指定 ID 的评论"""
    global comments_store

    # --- 内存方案 ---
    initial_length = len(comments_store)
    comments_store = [c for c in comments_store if c['id'] != comment_id]
    if len(comments_store) < initial_length:
        return jsonify({"message": "Comment deleted successfully"})
    else:
        return jsonify({"error": "Comment not found"}), 404

    # --- MySQL 方案 ---
    # conn = get_db_connection()
    # if not conn:
    #     return jsonify({"error": "Database connection failed"}), 500
    # cursor = conn.cursor()
    # try:
    #     # 检查评论是否存在
    #     cursor.execute("SELECT id FROM comments WHERE id = %s", (comment_id,))
    #     existing_comment = cursor.fetchone()
    #     if not existing_comment:
    #         return jsonify({"error": "Comment not found"}), 404

    #     # 删除评论
    #     sql = "DELETE FROM comments WHERE id = %s"
    #     cursor.execute(sql, (comment_id,))
    #     conn.commit()

    #     if cursor.rowcount > 0: # 检查是否有行被删除
    #       return jsonify({"message": "Comment deleted successfully"})
    #     else:
    #       return jsonify({"error": "Comment not found or already deleted"}), 404 # 可能并发删除了

    # except mysql.connector.Error as err:
    #     conn.rollback()
    #     print(f"Error deleting comment: {err}")
    #     return jsonify({"error": "Failed to delete comment"}), 500
    # finally:
    #     cursor.close()
    #     conn.close()

if __name__ == '__main__':
    # 如果使用 MySQL 方案且需要初始化数据库，可以在这里调用 init_db()
    # init_db()
    app.run(debug=True, port=5000) # 在 5000 端口运行，开启调试模式