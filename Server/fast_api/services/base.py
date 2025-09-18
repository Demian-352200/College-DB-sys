from Server.fast_api.common import LOGIN_SECRET
import jwt
from fastapi import Header, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

# 配置日志
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class BaseService:
    def set_attrs(self, obj, data: dict, ignore_fields=None):
        """
        将字典 data 中的键值对赋值给 obj 对象的属性。
        :param obj: 要设置属性的对象
        :param data: 包含属性值的字典
        :param ignore_fields: 需要忽略的字段名列表（如 id, create_time）
        :return: 是否有属性被修改
        """
        if not data or not isinstance(data, dict):
            return False

        ignore_fields = ignore_fields or set()
        updated = False

        for key, value in data.items():
            if key in ignore_fields:
                continue
            if hasattr(obj, key) and value is not None:
                setattr(obj, key, value)
                updated = True

        return updated

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    """
    从JWT token中获取当前用户ID
    """
    # 添加调试日志
    logger.debug(f"Received credentials: {credentials}")
    
    if not credentials:
        logger.debug("No credentials provided")
        raise HTTPException(
            status_code=401,
            detail="未提供认证令牌"
        )
    
    token = credentials.credentials
    logger.debug(f"Extracted token: {token}")
    
    if not token:
        logger.debug("Token is empty")
        raise HTTPException(
            status_code=401,
            detail="令牌为空"
        )
    
    try:
        # 确保token是字节类型
        if isinstance(token, str):
            token_bytes = token.encode('utf-8')
        else:
            token_bytes = token
            
        # 确保密钥是字节类型
        if isinstance(LOGIN_SECRET, str):
            secret_bytes = LOGIN_SECRET.encode('utf-8')
        else:
            secret_bytes = LOGIN_SECRET
            
        logger.debug(f"Token bytes type: {type(token_bytes)}")
        logger.debug(f"Secret bytes type: {type(secret_bytes)}")
            
        # 解码JWT token
        payload = jwt.decode(token_bytes, secret_bytes, algorithms=["HS256"])
        logger.debug(f"Decoded payload: {payload}")
        
        user_id = payload.get("user_id")
        logger.debug(f"User ID from payload: {user_id}")
        
        if user_id is None:
            logger.debug("User ID not found in payload")
            raise HTTPException(
                status_code=401,
                detail="令牌格式无效"
            )
            
        return user_id
    except jwt.ExpiredSignatureError:
        logger.debug("Token has expired")
        raise HTTPException(
            status_code=401,
            detail="令牌已过期"
        )
    except jwt.InvalidTokenError as e:
        logger.debug(f"Invalid token error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail=f"令牌无效: {str(e)}"
        )
    except Exception as e:
        logger.debug(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail=f"令牌解析错误: {str(e)}"
        )