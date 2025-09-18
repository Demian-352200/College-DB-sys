#!/bin/bash

# 数据库连接配置
DB_NAME="college_db"
DB_HOST="127.0.0.1"
DB_USER="college_admin"
DB_PASSWORD="Zzy123456_"
DB_PORT="3306"

# 输入文件配置
INPUT_FILE="college.gpkg"
LAYER_NAME=""  # 如果为空，将使用文件中的默认图层

# 输出表名
TABLE_NAME="col"

# EPSG代码
SOURCE_EPSG="EPSG:4326"

# 检查是否安装了ogr2ogr
if ! command -v ogr2ogr &> /dev/null
then
    echo "错误: 未找到 ogr2ogr 命令，请先安装 GDAL"
    exit 1
fi

# 显示使用说明
usage() {
    echo "用法: $0 [选项]"
    echo "选项:"
    echo "  -i, --input FILE        输入文件路径 (默认: $INPUT_FILE)"
    echo "  -t, --table TABLE       目标表名 (默认: $TABLE_NAME)"
    echo "  -l, --layer LAYER       图层名称 (默认: 文件默认图层)"
    echo "  -h, --help              显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0"
    echo "  $0 -i my_data.gpkg -t districts"
    echo "  $0 --input shapefile.shp --table counties --layer polygon_layer"
}

# 解析命令行参数
while [[ $# -gt 0 ]]
do
    key="$1"
    case $key in
        -i|--input)
        INPUT_FILE="$2"
        shift
        shift
        ;;
        -t|--table)
        TABLE_NAME="$2"
        shift
        shift
        ;;
        -l|--layer)
        LAYER_NAME="$2"
        shift
        shift
        ;;
        -h|--help)
        usage
        exit 0
        ;;
        *)
        echo "未知选项: $1"
        usage
        exit 1
        ;;
    esac
done

# 检查输入文件是否存在
if [ ! -f "$INPUT_FILE" ]; then
    echo "错误: 输入文件 '$INPUT_FILE' 不存在"
    exit 1
fi

# 构建连接字符串
CONN_STR="MYSQL:$DB_NAME,host=$DB_HOST,port=$DB_PORT,user=$DB_USER,password=$DB_PASSWORD"

# 构建 ogr2ogr 命令
CMD="ogr2ogr -f \"MySQL\" \"$CONN_STR\" -nln $TABLE_NAME -a_srs $SOURCE_EPSG"

# 如果指定了图层名，则添加到命令中
if [ -n "$LAYER_NAME" ]; then
    CMD="$CMD $INPUT_FILE $LAYER_NAME"
else
    CMD="$CMD $INPUT_FILE"
fi

# 执行导入命令
echo "正在执行导入命令:"
echo "$CMD"
echo "------------------------"

eval $CMD

if [ $? -eq 0 ]; then
    echo "------------------------"
    echo "数据导入成功完成!"
    echo "目标表: $TABLE_NAME"
else
    echo "------------------------"
    echo "数据导入失败!"
    exit 1
fi