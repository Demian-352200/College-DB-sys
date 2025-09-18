import requests
import json
from typing import List, Literal, Optional, Dict, Any
from autogen_core.tools import FunctionTool

BASE_URL = "http://localhost:8080"

# 高德地图API配置（需要在config.json中配置）
AMAP_API_KEY = "4f5f5a597664fab05f7e0288e5cfc47c"  # 需要在实际使用中替换为真实API密钥
AMAP_TRANSIT_ROUTE_URL = "https://restapi.amap.com/v3/direction/transit/integrated"
AMAP_GEO_CODING_URL = "https://restapi.amap.com/v3/geocode/geo"

def add_admin(admin_code: int, shape: str, name: str, level: Literal["省", "市", "县"]):
    """
    添加新行政区划数据

    Args:
        admin_code (int): 行政区划代码
        shape (str): WKT字符串，行政区划形状
        name (str): 行政区划名称
        level (Literal["省", "市", "县"]): 行政区划级别

    Returns:
        Dict[str, Any]: 添加结果
    """
    try:
        response = requests.post(
            f"{BASE_URL}/admin/",
            json={"admin_code": admin_code, "shape": shape, "name": name, "level": level}
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def get_admin_by_id(admin_code: int) -> Dict[str, Any]:
    """
    根据ID获取特定行政区划详细信息

    Args:
        admin_code (int): 行政区划代码

    Returns:
        Dict[str, Any]: 行政区划详细信息
    """
    try:
        response = requests.get(f"{BASE_URL}/admin/{admin_code}")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def get_all_colleges() -> List[Dict[str, Any]]:
    """
    获取所有高校数据
    
    Returns:
        List[Dict[str, Any]]: 高校数据列表
    """
    try:
        response = requests.get(f"{BASE_URL}/colleges/")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def get_college_by_id(college_id: int) -> Dict[str, Any]:
    """
    根据ID获取特定高校详细信息
    
    Args:
        college_id (int): 高校ID
        
    Returns:
        Dict[str, Any]: 高校详细信息
    """
    try:
        response = requests.get(f"{BASE_URL}/colleges/{college_id}")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def add_college(
    name: str,
    province: str,
    city: str,
    category: Literal['综合类', '理工类', '师范类', '医药类', '财经类', '艺术类', '农林类', '政法类', '其他', '语言类', '体育类', '军事类', '民族类'],
    nature: Literal['公办', '民办', '中外合办'],
    type: Literal['本科', '专科'],
    is_985: bool,
    is_211: bool,
    is_double_first: bool,
    address: str,
    latitude: float,
    longitude: float,
    shape: str,
    affiliation: str,
    admin_code: int
) -> Dict[str, Any]:
    """
    添加一个新高校数据

    :param name: 大学名称
    :param province: 所在省份
    :param city: 所在城市
    :param category:大学种类
    :param nature:办学性质
    :param type:本科或专科
    :param is_985:是否为985
    :param is_211:是否为211
    :param is_double_first:是否为双一流
    :param address:地址
    :param latitude:纬度
    :param longitude:经度
    :param shape:WKT字符串，如POINT(112.324 38.234)
    :param affiliation:隶属于
    :param admin_code:行政区划编码
    :return:Dict[str, Any]: 大学详细信息
    """
    try:
        response = requests.post(
            f"{BASE_URL}/colleges/",
            json={
                "name": name,
                "province": province,
                "city": city,
                "category": category,
                "nature": nature,
                "type": type,
                "is_985": is_985,
                "is_211": is_211,
                "is_double_first": is_double_first,
                "address": address,
                "latitude": latitude,
                "longitude": longitude,
                "shape": shape,
                "affiliation": affiliation,
                "admin_code": admin_code
            }
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def update_college(
    college_id: int,
    shape:Optional[str],
    name: Optional[str],
    province: Optional[str],
    city: Optional[str],
    category: Optional[Literal['综合类', '理工类', '师范类', '医药类', '财经类', '艺术类', '农林类', '政法类', '其他', '语言类', '体育类', '军事类', '民族类']],
    nature: Optional[Literal['公办', '民办', '中外合办']],
    type: Optional[Literal['本科', '专科']],
    is_985: Optional[bool],
    is_211: Optional[bool],
    is_double_first: Optional[bool],
    address: Optional[str],
    latitude: Optional[float],
    longitude: Optional[float],
    affiliation: Optional[str],
    admin_code: Optional[int]
)-> Dict[str, Any]:
    """
    更新一个高校数据

    :param province: 所在省份
    :param city: 所在城市
    :param category:大学种类
    :param nature:办学性质
    :param type:本科或专科
    :param is_985:是否为985
    :param is_211:是否为211
    :param is_double_first:是否为双一流
    :param address:地址
    :param latitude:纬度
    :param longitude:经度
    :param shape:WKT字符串，如POINT(112.324 38.234)
    :param affiliation:隶属于
    :param admin_code:行政区划编码
    :return:Dict[str, Any]: 大学详细信息
    """
    try:
        response = requests.put(
            f"{BASE_URL}/colleges/{college_id}",
            json={
                "name": name,
                "province": province,
                "city": city,
                "category": category,
                "nature": nature,
                "type": type,
                "is_985": is_985,
                "is_211": is_211,
                "is_double_first": is_double_first,
                "address": address,
                "latitude": latitude,
                "longitude": longitude,
                "shape": shape,
                "affiliation": affiliation,
                "admin_code": admin_code
            }
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def search_colleges(
    name: Optional[str] = None,
    province: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    nature: Optional[str] = None,
    type: Optional[str] = None,
    is_985: Optional[bool] = None,
    is_211: Optional[bool] = None,
    is_double_first: Optional[bool] = None
) -> List[Dict[str, Any]]:
    """
    多条件组合筛选高校
    
    Args:
        name (Optional[str]): 高校名称
        province (Optional[str]): 省份
        city (Optional[str]): 城市
        category (Optional[str]): 类别
        nature (Optional[str]): 性质
        type (Optional[str]): 类型
        is_985 (Optional[bool]): 是否985高校
        is_211 (Optional[bool]): 是否211高校
        is_double_first (Optional[bool]): 是否双一流高校
        
    Returns:
        List[Dict[str, Any]]: 符合条件的高校列表
    """
    try:
        params = {
            "name": name,
            "province": province,
            "city": city,
            "category": category,
            "nature": nature,
            "type": type,
            "is_985": is_985,
            "is_211": is_211,
            "is_double_first": is_double_first
        }
        # 移除None值
        params = {k: v for k, v in params.items() if v is not None}
        
        response = requests.get(f"{BASE_URL}/colleges/search/", params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def del_college_by_id(college_id: int):
    """
    根据ID删除特定高校数据

    Args:
        college_id (int): 高校ID

    Returns:
        Dict[str, Any]: 删除结果
    """
    try:
        response = requests.delete(f"{BASE_URL}/colleges/{college_id}")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def get_all_climate() -> List[Dict[str, Any]]:
    """
    获取所有气候数据
    
    Returns:
        List[Dict[str, Any]]: 气候数据列表
    """
    try:
        response = requests.get(f"{BASE_URL}/climate/")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def add_climate(
    year: int,
    month: int,
    annual_avg_temp: float,
    monthly_avg_temp: float,
    annual_precipitation: float,
    monthly_avg_precip: float,
    admin_code: int
) -> Dict[str, Any]:
    """
    添加新气候数据

    Args:
        year (int): 年份
        month (int): 月份
        annual_avg_temp (float): 年均气温
        monthly_avg_temp (float): 月均气温
        annual_precipitation (float): 年均降水量
        monthly_avg_precip (float): 月均降水量
        admin_code (int): 行政区代码

    Returns:
        Dict[str, Any]: 添加结果
    """
    try:
        response = requests.post(
            f"{BASE_URL}/climate/",
            json={
                "year": year,
                "month": month,
                "annual_avg_temp": annual_avg_temp,
                "monthly_avg_temp": monthly_avg_temp,
                "annual_precipitation": annual_precipitation,
                "monthly_avg_precip": monthly_avg_precip,
                "admin_code": admin_code
            }
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def add_evaluation_for_college(college_id: int,
                               Dietary_evaluation:Optional[str],
                               Traffic_evaluation:Optional[str],
                               Evaluation:Optional[str]):
    """
    为特定高校添加评价数据

    Args:
        college_id (int): 高校ID
        Dietary_evaluation (Optional[str]): 饮食评价
        Traffic_evaluation (Optional[str]): 交通评价
        Evaluation (Optional[str]): 自由补充评价

    Returns:
        Dict[str, Any]: 添加结果
    """
    try:
        response = requests.post(
            f"{BASE_URL}/colleges/{college_id}/evaluations/",
            json={
                "Dietary_evaluation": Dietary_evaluation,
                "Traffic_evaluation": Traffic_evaluation,
                "Evaluation": Evaluation
            }
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def update_evaluation_for_college(evaluation_id: int,
                                   Dietary_evaluation:Optional[str],
                                   Traffic_evaluation:Optional[str],
                                   Evaluation:Optional[str]):
    """
    更新特定评价数据

    Args:
        evaluation_id (int): 评价ID
        Dietary_evaluation (Optional[str]): 饮食评价
        Traffic_evaluation (Optional[str]): 交通评价
        Evaluation (Optional[str]): 自由补充评价

    Returns:
        Dict[str, Any]: 更新结果
    """
    try:
        response = requests.put(
            f"{BASE_URL}/evaluations/{evaluation_id}",
            json={
                "Dietary_evaluation": Dietary_evaluation,
                "Traffic_evaluation": Traffic_evaluation,
                "Evaluation": Evaluation
            }
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}


def del_evaluation_by_id(evaluation_id: int):
    """
    根据ID删除特定评价数据

    Args:
        evaluation_id (int): 评价ID

    Returns:
        Dict[str, Any]: 删除结果
    """
    try:
        response = requests.delete(f"{BASE_URL}/evaluations/{evaluation_id}")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}
def get_climate_by_id(climate_id: int) -> Dict[str, Any]:
    """
    根据ID获取特定区域气候详细信息
    
    Args:
        climate_id (int): 气候数据ID
        
    Returns:
        Dict[str, Any]: 气候详细信息
    """
    try:
        response = requests.get(f"{BASE_URL}/climate/{climate_id}")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def get_all_admin_divisions() -> List[Dict[str, Any]]:
    """
    获取所有行政区划数据
    
    Returns:
        List[Dict[str, Any]]: 行政区划数据列表
    """
    try:
        response = requests.get(f"{BASE_URL}/admin/")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def get_all_evaluations() -> List[Dict[str, Any]]:
    """
    获取所有评价数据

    Returns:
        List[Dict[str, Any]]: 评价数据列表
    """
    try:
        response = requests.get(f"{BASE_URL}/colleges/evaluations/")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def get_admin_division_by_id(admin_code: int) -> Dict[str, Any]:
    """
    根据ID获取特定行政区划详细信息
    
    Args:
        admin_code (int): 行政区划代码
        
    Returns:
        Dict[str, Any]: 行政区划详细信息
    """
    try:
        response = requests.get(f"{BASE_URL}/admin/{admin_code}")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def get_all_users() -> List[Dict[str, Any]]:
    """
    获取所有用户信息

    Returns:
        List[Dict[str, Any]]: 用户信息列表
    """
    try:
        response = requests.get(f"{BASE_URL}/user/")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

# def plan_transit_route(
#     # ad1: Optional[str],
#     # ad2: Optional[str],
#     origin: str,
#     destination: str,
#     city1: str = "021",
#     city2: str = "010",
#
# ) -> Dict[str, Any]:
#     """
#     使用高德地图API v5规划公交路线（路径规划2.0）
#
#     Args:
#         ad1(str):可选，起点所在行政区域编码，仅支持adcode
#         ad1(str):可选，终点所在行政区域编码，仅支持adcode
#         origin (str): 起点经纬度，经纬度小数点后不超过6位，格式："经度,纬度"，例如："116.481488,39.990464"
#         destination (str): 终点经纬度，经纬度小数点后不超过6位，格式："经度,纬度"，例如："116.434446,39.90816"
#         city1 (str): 起点城市，仅支持citycode，相同时代表同城，不同时代表跨城
#         city2 (str): 终点城市，仅支持citycode，相同时代表同城，不同时代表跨城
#
#     Returns:
#         Dict[str, Any]: 路线规划结果
#     """
#     try:
#         params = {
#             "key": AMAP_API_KEY,
#             "origin": origin,
#             "destination": destination,
#             "city1": city1,
#             "city2": city2,
#             # "ad1": ad1,
#             # "ad2": ad2
#         }
#
#         # 移除空值参数
#         params = {k: v for k, v in params.items() if v}
#
#         response = requests.get(AMAP_TRANSIT_ROUTE_URL, params=params)
#         response.raise_for_status()
#         result = response.json()
#
#         if result.get("status") == "1":
#             return result
#         else:
#             return {
#                 "success": False,
#                 "error_code": result.get("infocode"),
#                 "message": result.get("info", "路线规划失败")
#             }
#     except Exception as e:
#         return {
#             "success": False,
#             "error": str(e),
#             "message": "请求高德地图API时发生错误"
#         }

def get_geo_info(address: str, city: Optional[str]) -> Dict[str, Any]:
    """
    使用高德地图API v3获取地理信息编码，包括经纬度，citycode，adcode等

    Args:
        address (str): 结构化地址信息,规则遵循：国家、省份、城市、区县、城镇、乡村、街道、门牌号码、屋邨、大厦，如：北京市朝阳区阜通东大街6号。
        city (str): 城市,指定查询的城市,可选输入内容包括：指定城市的中文（如北京）、指定城市的中文全拼（beijing）、citycode（010）、adcode（110000），不支持县级市。当指定城市查询内容为空时，会进行全国范围内的地址转换检索。

    Returns:
        Dict[str, Any]: 地理信息编码，包括经纬度，citycode，adcode等
    """
    try:
        params = {
            "key": AMAP_API_KEY,
            "address": address,
            "city": city
        }
        # 移除空值参数
        params = {k: v for k, v in params.items() if v}
        response = requests.get(AMAP_GEO_CODING_URL, params=params)
        response.raise_for_status()
        result = response.json()
        if result.get("status") == "1":
            return result
        else:
            return {
                "success": False,
                "error_code": result.get("infocode"),
                "message": result.get("info")
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "请求高德地图API时发生错误"
        }


def plan_transit_route(
        origin: str,
        destination: str,
        city: str = "",
        cityd: str = "",
        nightflag: str = "1",

) -> Dict[str, Any]:
    """
    使用高德地图API v3规划公交路线（路径规划）

    Args:
        origin (str): 起点经纬度，经纬度小数点后不超过6位，格式："经度,纬度"，例如："116.481488,39.990464"
        destination (str): 终点经纬度，经纬度小数点后不超过6位，格式："经度,纬度"，例如："116.434446,39.90816"
        city (str): 城市/跨城规划时的起点城市，可选值：城市名称/citycode，相同时代表同城，不同时代表跨城
        cityd (str): 跨城公交规划时的终点城市，可选值：城市名称/citycode，跨城公交规划必填参数。

    Returns:
        Dict[str, Any]: 路线规划结果
    """
    try:
        params = {
            "key": AMAP_API_KEY,
            "origin": origin,
            "destination": destination,
            "city1": city,
            "cityd": cityd,
            "nightflag": nightflag,
        }

        # 移除空值参数
        params = {k: v for k, v in params.items() if v}

        response = requests.get(AMAP_TRANSIT_ROUTE_URL, params=params)
        response.raise_for_status()
        result = response.json()

        if result.get("status") == "1":
            return result
        else:
            return {
                "success": False,
                "error_code": result.get("infocode"),
                "message": result.get("info", "路线规划失败")
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "请求高德地图API时发生错误"
        }

# 创建工具实例
get_all_colleges_tool = FunctionTool(
    get_all_colleges,
    description="获取所有高校数据"
)

get_college_by_id_tool = FunctionTool(
    get_college_by_id,
    description="根据ID获取特定高校详细信息"
)

add_college_tool = FunctionTool(
    add_college,
    description="添加一个新高校"
)

add_evaluation_for_college_tool=FunctionTool(
    add_evaluation_for_college,
    description="为特定高校添加评价"
)

update_evaluation_for_college_tool = FunctionTool(
    update_evaluation_for_college,
    description="更新特定高校的评价"
)

del_evaluation_by_id_tool = FunctionTool(
    del_evaluation_by_id,
    description="根据ID删除特定评价"
)

del_college_by_id_tool = FunctionTool(
    del_college_by_id,
    description="根据ID删除特定高校"
)

search_colleges_tool = FunctionTool(
    search_colleges,
    description="多条件组合筛选高校"
)

update_college_tool = FunctionTool(
    update_college,
    description="更新特定高校信息"
)

get_all_climate_tool = FunctionTool(
    get_all_climate,
    description="获取所有气候数据"
)

add_climate_tool = FunctionTool(
    add_climate,
    description="添加一个新气候数据"
)

get_climate_by_id_tool = FunctionTool(
    get_climate_by_id,
    description="根据ID获取特定区域气候详细信息"
)

get_all_admin_divisions_tool = FunctionTool(
    get_all_admin_divisions,
    description="获取所有行政区划数据"
)

add_admin_divisions_tool = FunctionTool(
    add_admin,
    description="添加一个新行政区划"
)

get_admin_divisions_by_id_tool = FunctionTool(
    get_admin_division_by_id,
    description="获取特定行政区划详细信息"
)

get_admin_division_by_id_tool = FunctionTool(
    get_admin_division_by_id,
    description="根据ID获取特定行政区划详细信息"
)

get_all_users_tool = FunctionTool(
    get_all_users,
    description="获取所有用户数据"
)

get_all_evaluations_tool = FunctionTool(
    get_all_evaluations,
    description="获取所有评价数据"
)

plan_transit_route_tool = FunctionTool(
    plan_transit_route,
    description="使用高德地图API v3规划公交路线（路径规划），参数：起点经纬度(origin)、终点经纬度(destination)、起点城市(city)、终点城市(cityd),夜间出行(nightflag,默认为1，开启)"
)

get_geo_info_tool = FunctionTool(
    get_geo_info,
    description="使用髙德地图API 地理编码查询接口，参数：地址(address)、城市(city，可选值)"
)