from Server.fast_api.services import BaseService
from sqlalchemy import select, desc
from fastapi import FastAPI, Path, Query, Body, Cookie, Header, Request, Response, HTTPException, status, Depends
from Server.fast_api.resources import Session, get_db_session
from Server.fast_api.model import CollegeModel, EvaluationModel, UserModel, CollegeReviewModel, PendingCollegeModel,ModificationHistoryModel
from typing import List, Optional
from geoalchemy2 import WKTElement
from sqlalchemy import Select
from datetime import datetime
import json


class CollegeService(BaseService):
    def get_college_by_id(self, college_id: int, db_session: Session):
        """
        根据ID获取特定高校信息
        """
        return db_session.get(CollegeModel, college_id)

    def get_all_colleges(self, db_session: Session):
        """
        获取所有高校数据
        """
        query = Select(CollegeModel)
        result = db_session.execute(query).scalars().all()
        return result

    def search_colleges(self, name: Optional[str], province: Optional[str], city: Optional[str],
                        category: Optional[str], nature: Optional[str], type: Optional[str],
                        is_985: Optional[bool] = None, is_211: Optional[bool] = None,
                        is_double_first: Optional[bool] = None, db_session: Session = None):
        """
        多条件组合筛选高校
        """
        query = select(CollegeModel)

        if name:
            query = query.where(CollegeModel.name.like(f"%{name}%"))
        if province:
            query = query.where(CollegeModel.province == province)
        if city:
            query = query.where(CollegeModel.city == city)
        if category:
            query = query.where(CollegeModel.category == category)
        if nature:
            query = query.where(CollegeModel.nature == nature)
        if type:
            query = query.where(CollegeModel.type == type)
        if is_985 is not None:
            query = query.where(CollegeModel.is_985 == (1 if is_985 else 0))
        if is_211 is not None:
            query = query.where(CollegeModel.is_211 == (1 if is_211 else 0))
        if is_double_first is not None:
            query = query.where(CollegeModel.is_double_first == (1 if is_double_first else 0))

        items = db_session.scalars(query).all()
        return items

    def get_college_with_evaluation(self, college_id: int, db_session: Session):
        """
        获取特定高校详细信息及评价信息
        """
        college = db_session.get(CollegeModel, college_id)
        if not college:
            return None

        # 获取该高校的所有评价
        evaluations_query = select(EvaluationModel).where(EvaluationModel.college_id == college_id)
        evaluations = db_session.scalars(evaluations_query).all()

        return {
            "college": college,
            "evaluations": evaluations
        }

    def add_college(self, college_data: dict, user_id: int, db_session: Session):
        """
        添加新高校
        """
        # 获取用户信息以检查权限
        user = db_session.get(UserModel, user_id)
        if not user:
            raise ValueError("用户不存在")

        # 检查高校名称是否已存在
        query = select(CollegeModel).where(CollegeModel.name == college_data['name'])
        existing_college = db_session.execute(query).scalars().first()
        if existing_college:
            raise ValueError("高校名称已存在")

        # 管理员可以直接添加高校，普通用户需要审核
        if user.role == 'admin':
            # 管理员直接创建高校
            return self._create_college_directly(college_data, db_session)
        else:
            # 普通用户提交高校信息等待审核
            return self._submit_college_for_review(college_data, user_id, db_session)

    def _create_college_directly(self, college_data: dict, db_session: Session):
        """
        管理员直接创建高校
        """
        # 创建几何对象
        try:
            shape = WKTElement(college_data['shape'])
        except Exception as e:
            raise ValueError(f"几何数据格式错误: {str(e)}")

        # 创建新高校对象
        new_college = CollegeModel(
            college_id=college_data['college_id'],
            shape=shape,
            province=college_data['province'],
            name=college_data['name'],
            category=college_data['category'],
            nature=college_data['nature'],
            type=college_data.get('type'),
            is_985=college_data.get('is_985', 0),
            is_211=college_data.get('is_211', 0),
            is_double_first=college_data.get('is_double_first', 0),
            city=college_data['city'],
            affiliation=college_data.get('affiliation'),
            address=college_data.get('address'),
            longitude=college_data['longitude'],
            latitude=college_data['latitude'],
            admin_code=college_data.get('admin_code')
        )

        # 保存到数据库
        db_session.add(new_college)
        db_session.commit()
        db_session.refresh(new_college)
        return new_college

    def _submit_college_for_review(self, college_data: dict, user_id: int, db_session: Session):
        """
        普通用户提交高校信息等待审核
        """
        # 检查高校名称是否已存在
        query = select(CollegeModel).where(CollegeModel.name == college_data['name'])
        existing_college = db_session.execute(query).scalars().first()
        if existing_college:
            raise ValueError("高校名称已存在")

        # 检查用户角色
        from Server.fast_api.services import UserService
        user = UserService().get_user_by_id(user_id, db_session)

        if not user:
            raise ValueError("用户不存在")

        # 先创建审核记录
        review_record = CollegeReviewModel(
            user_id=user_id,
            status='pending',
            submit_time=datetime.now(),
            review_type='new',  # 指定审核类型为新建高校
            review_comment="用户请求添加新高校"
        )

        # 保存审核记录
        db_session.add(review_record)
        db_session.flush()  # 获取review_id

        try:
            # 如果提供了shape则使用新值，否则使用原始值
            if 'shape' in college_data and college_data['shape'] is not None:
                shape = WKTElement(college_data['shape'])
        except Exception as e:
            raise ValueError(f"几何数据格式错误: {str(e)}")

        # 将高校信息存储到待审核表中，使用review_id作为主键
        pending_college = PendingCollegeModel(
            review_id=review_record.review_id,
            user_id=user_id,
            shape=shape,
            college_id=college_data.get('college_id'),
            province=college_data.get('province'),
            name=college_data.get('name'),
            category=college_data.get("category"),
            nature=college_data.get('nature'),
            type=college_data.get('type'),
            is_985=college_data.get('is_985', 0),
            is_211=college_data.get('is_211', 0),
            is_double_first=college_data.get('is_double_first', 0),
            city=college_data.get('city'),
            affiliation=college_data.get('affiliation'),
            address=college_data.get('address'),
            longitude=college_data.get('longitude'),
            latitude=college_data.get('latitude'),
            admin_code=college_data.get('admin_code')
        )

        # 保存到待审核表
        db_session.add(pending_college)
        db_session.commit()
        db_session.refresh(review_record)

        # 返回审核信息
        return {
            "message": "高校信息已提交，等待管理员审核",
            "review_id": review_record.review_id
        }

    def add_evaluation(self, evaluation_data: dict, user_id: int, db_session: Session):
        """
        添加评价
        """
        # 检查高校是否存在
        college = db_session.get(CollegeModel, evaluation_data['college_id'])
        if not college:
            raise ValueError("高校不存在")

        # 创建评价对象
        new_evaluation = EvaluationModel(
            college_id=evaluation_data['college_id'],
            user_id=user_id,  # 使用从JWT token中获取的用户ID
            Dietary_evaluation=evaluation_data.get('Dietary_evaluation'),
            Traffic_evaluation=evaluation_data.get('Traffic_evaluation'),
            Evaluation=evaluation_data.get('Evaluation')
        )

        # 保存到数据库
        db_session.add(new_evaluation)
        db_session.commit()
        db_session.refresh(new_evaluation)
        return new_evaluation

    def get_all_evaluations(self,user_id:int, db_session: Session):
        """
        获取用户发布的所有评价信息
        """
        return db_session.query(EvaluationModel).filter(EvaluationModel.user_id == user_id).all()


    def update_evaluation(self, evaluation_id: int, college_data: dict, user_id: int, db_session: Session):
        """
        更新评价信息
        """
        # 获取现有评价信息
        evaluation = db_session.get(EvaluationModel, evaluation_id)

        if not evaluation:
            raise ValueError("评价不存在")
        
        # 检查权限：只有评价发布者或管理员可以修改评价
        user = db_session.get(UserModel, user_id)
        if not user:
            raise ValueError("用户不存在")
            
        if evaluation.user_id != user_id and user.role != 'admin':
            raise ValueError("无权限修改此评价")

        # 记录修改前的数据
        old_data = json.dumps(evaluation.serialize(), ensure_ascii=False)

        # 更新评价信息
        for key, value in college_data.items():
            if hasattr(evaluation, key) and value is not None:
                setattr(evaluation, key, value)

        db_session.commit()

        # 记录修改历史
        new_data = json.dumps(evaluation.serialize(), ensure_ascii=False)
        history = ModificationHistoryModel(
            entity_type='evaluation',
            entity_id=evaluation_id,
            old_data=old_data,
            new_data=new_data,
            user_id=user_id,
            modification_type='update'
        )
        db_session.add(history)
        db_session.commit()

        return evaluation

    def delete_evaluation(self, evaluation_id: int, user_id: int, db_session: Session):
        """
        删除评价信息
        """
        # 获取现有评价信息
        evaluation = db_session.get(EvaluationModel, evaluation_id)

        if not evaluation:
            raise ValueError("评价不存在")
        
        # 检查权限：只有评价发布者或管理员可以删除评价
        user = db_session.get(UserModel, user_id)
        if not user:
            raise ValueError("用户不存在")
            
        if evaluation.user_id != user_id and user.role != 'admin':
            raise ValueError("无权限删除此评价")

        # 记录删除前的数据
        old_data = json.dumps(evaluation.serialize(), ensure_ascii=False)
        
        # 删除评价
        db_session.delete(evaluation)
        db_session.commit()

        # 记录删除历史
        history = ModificationHistoryModel(
            entity_type='evaluation',
            entity_id=evaluation_id,
            old_data=old_data,
            new_data=None,
            user_id=user_id,
            modification_type='delete'
        )
        db_session.add(history)
        db_session.commit()

        return {"message": "评价删除成功"}

    def delete_college(self, college_id: int, user_id: int, db_session: Session):
        """
        删除高校信息（仅管理员）
        """
        # 检查用户角色
        from Server.fast_api.services import UserService
        user = UserService().get_user_by_id(user_id, db_session)

        if not user or user.role != 'admin':
            raise ValueError("非管理员权限！")

        # 获取高校信息
        college = db_session.get(CollegeModel, college_id)

        if not college:
            raise ValueError(f"高校ID {college_id} 不存在")

        # 记录删除前的数据
        old_data = json.dumps(college.serialize(), ensure_ascii=False)
        
        # 删除相关评价
        evaluations_query = select(EvaluationModel).where(EvaluationModel.college_id == college_id)
        evaluations = db_session.scalars(evaluations_query).all()
        
        # 记录评价的删除历史
        for evaluation in evaluations:
            eval_old_data = json.dumps(evaluation.serialize(), ensure_ascii=False)
            # 添加评价删除历史记录
            eval_history = ModificationHistoryModel(
                entity_type='evaluation',
                entity_id=evaluation.evaluation_id,
                old_data=eval_old_data,
                new_data=None,
                user_id=user_id,
                modification_type='delete'
            )
            db_session.add(eval_history)
        
        # 先删除所有相关的评价
        for evaluation in evaluations:
            db_session.delete(evaluation)
        
        db_session.flush()  # 确保评价已删除
        
        # 删除高校
        db_session.delete(college)
        
        # 记录高校删除历史
        history = ModificationHistoryModel(
            entity_type='college',
            entity_id=college_id,
            old_data=old_data,
            new_data=None,
            user_id=user_id,
            modification_type='delete'
        )
        db_session.add(history)
        db_session.commit()

        return {"message": "高校删除成功"}

    def review_pending_college(self, review_id: int, status: str, comment: Optional[str], user_id: int, db_session: Session):
        """
        审核待处理的高校信息（仅管理员）
        """
        # 检查用户角色
        from Server.fast_api.services import UserService
        user = UserService().get_user_by_id(user_id, db_session)

        if not user or user.role != 'admin':
            raise ValueError("非管理员权限！")
            
        if status not in ['approved', 'rejected']:
            raise ValueError("审核状态必须为 'approved' 或 'rejected'")

        # 获取审核记录
        review = db_session.get(CollegeReviewModel, review_id)
        if not review:
            raise ValueError("审核记录不存在")

        # 更新审核状态
        review.status = status
        review.review_time = datetime.now()
        review.reviewer_id = user_id
        review.review_comment = comment

        # 处理审核结果
        if status == 'approved':
            # 获取待审核的高校信息
            pending_college = db_session.get(PendingCollegeModel, review_id)
            if pending_college:
                # 根据审核类型处理
                if review.review_type == 'new':
                    # 新建高校
                    college = CollegeModel(
                        shape=pending_college.shape,
                        province=pending_college.province,
                        name=pending_college.name,
                        category=pending_college.category,
                        nature=pending_college.nature,
                        type=pending_college.type,
                        is_985=pending_college.is_985,
                        is_211=pending_college.is_211,
                        is_double_first=pending_college.is_double_first,
                        city=pending_college.city,
                        affiliation=pending_college.affiliation,
                        address=pending_college.address,
                        longitude=pending_college.longitude,
                        latitude=pending_college.latitude,
                        admin_code=pending_college.admin_code
                    )
                    
                    db_session.add(college)
                    db_session.flush()  # 获取college_id
                    
                    # 更新审核记录中的college_id
                    review.college_id = college.college_id
                    
                elif review.review_type == 'update' and review.college_id is not None:
                    # 更新高校信息
                    college = db_session.get(CollegeModel, review.college_id)
                    if college:
                        # 记录修改前的数据
                        old_data = json.dumps(college.serialize(), ensure_ascii=False)
                        
                        # 获取待审核的高校信息
                        pending_college = db_session.get(PendingCollegeModel, review.review_id)
                        if pending_college:
                            college.shape = pending_college.shape
                            college.province = pending_college.province
                            college.name = pending_college.name
                            college.category = pending_college.category
                            college.nature = pending_college.nature
                            college.type = pending_college.type
                            college.is_985 = pending_college.is_985
                            college.is_211 = pending_college.is_211
                            college.is_double_first = pending_college.is_double_first
                            college.city = pending_college.city
                            college.affiliation = pending_college.affiliation
                            college.address = pending_college.address
                            college.longitude = pending_college.longitude
                            college.latitude = pending_college.latitude
                            college.admin_code = pending_college.admin_code
                        
                        db_session.flush()
                        
                        # 记录修改历史
                        new_data = json.dumps(college.serialize(), ensure_ascii=False)
                        history = ModificationHistoryModel(
                            entity_type='college',
                            entity_id=college.college_id,
                            old_data=old_data,
                            new_data=new_data,
                            user_id=user_id,
                            modification_type='update'
                        )
                        db_session.add(history)

        db_session.commit()
        db_session.refresh(review)

        return {
            "message": f"高校审核{ '通过' if status == 'approved' else '拒绝' }",
            "review_id": review_id,
            "status": status
        }

    def update_college(self, college_id: int, college_data: dict, user_id: int, db_session: Session):
        """
        更新高校信息（管理员直接更新，普通用户提交审核）
        """
        # 检查用户角色
        from Server.fast_api.services import UserService
        user = UserService().get_user_by_id(user_id, db_session)

        if not user:
            raise ValueError("用户不存在")

        # 获取现有高校信息
        college = db_session.get(CollegeModel, college_id)

        if not college:
            raise ValueError("高校不存在")

        # 管理员可以直接更新高校信息
        if user.role == 'admin':
            # 记录修改前的数据
            old_data = json.dumps(college.serialize(), ensure_ascii=False)

            # 更新高校信息
            for key, value in college_data.items():
                if hasattr(college, key) and value is not None:
                    setattr(college, key, value)

            # 如果有几何数据更新
            if 'shape' in college_data and college_data['shape'] is not None:
                try:
                    shape = WKTElement(college_data['shape'])
                    college.shape = shape
                except Exception as e:
                    raise ValueError(f"几何数据格式错误: {str(e)}")

            db_session.commit()

            # 记录修改历史
            new_data = json.dumps(college.serialize(), ensure_ascii=False)
            history = ModificationHistoryModel(
                entity_type='college',
                entity_id=college_id,
                old_data=old_data,
                new_data=new_data,
                user_id=user_id,
                modification_type='update'
            )
            db_session.add(history)
            db_session.commit()

            return college
        else:
            # 普通用户需要提交审核，采用与新建高校类似的逻辑
            return self._submit_college_update_for_review(college_id, college_data, user_id, db_session)

    def _submit_college_update_for_review(self, college_id: int, college_data: dict, user_id: int, db_session: Session):
        """
        普通用户提交高校信息更新等待审核（与新建高校类似的逻辑）
        """
        # 获取现有高校信息
        college = db_session.get(CollegeModel, college_id)
        if not college:
            raise ValueError("高校不存在")

        # 先创建审核记录
        review_record = CollegeReviewModel(
            college_id=college_id,
            user_id=user_id,
            status='pending',
            submit_time=datetime.now(),
            review_type='update',  # 指定审核类型为更新高校
            review_comment="用户请求更新高校信息"
        )

        # 保存审核记录
        db_session.add(review_record)
        db_session.flush()  # 获取review_id

        # 创建待审核的高校更新信息
        # 使用与PendingCollegeModel相同的字段结构，但存储的是更新信息
        # 只有在college_data中提供了字段值时才使用，否则使用原始值
        try:
            # 如果提供了shape则使用新值，否则使用原始值
            if 'shape' in college_data and college_data['shape'] is not None:
                shape = WKTElement(college_data['shape'])
            else:
                shape = college.shape
        except Exception as e:
            raise ValueError(f"几何数据格式错误: {str(e)}")

        # 构建待审核的高校信息，只更新用户提供的字段
        pending_college_data = PendingCollegeModel(
            review_id = review_record.review_id,
            user_id = user_id,
            college_id=college_data.get('college_id', college.college_id),
            shape= shape,
            province = college_data.get('province', college.province),
            name= college_data.get('name', college.name),
            category= college_data.get('category', college.category),
            nature= college_data.get('nature', college.nature),
            type= college_data.get('type', college.type),
            is_985= college_data.get('is_985', college.is_985),
            is_211= college_data.get('is_211', college.is_211),
            is_double_first= college_data.get('is_double_first', college.is_double_first),
            city=college_data.get('city', college.city),
            affiliation= college_data.get('affiliation', college.affiliation),
            address= college_data.get('address', college.address),
            longitude= college_data.get('longitude', college.longitude),
            latitude= college_data.get('latitude', college.latitude),
            admin_code= college_data.get('admin_code', college.admin_code)
        )

        # 保存到待审核表
        db_session.add(pending_college_data)
        db_session.commit()
        db_session.refresh(review_record)

        # 返回审核信息
        return {
            "message": "高校信息更新已提交，等待管理员审核",
            "review_id": review_record.review_id
        }

    def get_pending_reviews(self, user_id: int, db_session: Session):
        """
        获取所有待审核信息（仅管理员）
        """
        # 检查用户角色
        from Server.fast_api.services import UserService
        user = UserService().get_user_by_id(user_id, db_session)

        if not user or user.role != 'admin':
            raise ValueError("非管理员权限！")

        # 查询所有待审核记录
        query = select(CollegeReviewModel).where(CollegeReviewModel.status == 'pending')
        pending_reviews = db_session.scalars(query).all()

        result = []
        for review in pending_reviews:
            review_info = {
                "review_id": review.review_id,
                "user_id": review.user_id,
                "status": review.status,
                "submit_time": review.submit_time.isoformat() if review.submit_time else None,
                "review_comment": review.review_comment,
                "review_type": review.review_type
            }

            # 获取待审核的高校信息
            pending_college = db_session.get(PendingCollegeModel, review.review_id)
            if pending_college:
                review_info["pending_college"] = pending_college.serialize()
                
            # 如果是更新高校，也获取原始高校信息
            if review.college_id is not None and review.review_type == 'update':
                college = db_session.get(CollegeModel, review.college_id)
                if college:
                    review_info["original_college"] = college.serialize()
                        
            result.append(review_info)

        return result

    def get_pendingdetail_reviews(self,user_id:int,review_id:int,db_session:Session):
        """
        获取待审核表单详细信息
        """
        # 检查用户角色
        from Server.fast_api.services import UserService
        user = UserService().get_user_by_id(user_id, db_session)

        if not user or user.role != 'admin':
            raise ValueError("非管理员权限！")

        return db_session.get(PendingCollegeModel, review_id)



