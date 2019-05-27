import React from 'react'
import $ from 'jquery'
import {Table,Modal,Button} from 'antd'
import './Usermanager.css';
class Usermanager extends React.Component{

    constructor(){
        super();
        this.state={
            users:[],
            roles:[],
            userAR:[],
            selectedRowKeys:[],
            visible:false,
            loading: false,
            form:{
                name:'',
                telephone:'',
                password:'',
                roleId:''
            }
        }
    }
    componentDidMount(){
      //组件绑定后初始化数据
      this.loadRoleuserAndRole();
      this.loadUser(); 
      this.loadRole();   
    }
    loadUser=()=>{
      console.log('loaduser',JSON.this);
      let url='http://127.0.0.1:9999/User/findAll';
      $.get(url,({status,message,data})=>{
          if(status ===200){
              //将data中的数据更新状态中
              this.setState({
                  users:data
              });
              
          }else{
              alert(message);
          }

      });
  }
  loadRoleuserAndRole(){
    $.get("http://127.0.0.1:9999/User/userandrole",({status,message,data})=>{
      if(status === 200){
        this.setState({
          "userAR":data,
          form:{...this.state.form,...{id:data[0].id}}
        })
      } else {alert (message)}
    })
  }
  loadRole(){
    $.get("http://127.0.0.1:9999/Role/findAll",({status,message,data})=>{
      if(status === 200){
        this.setState({
          "roles":data,
          form:{...this.state.form,...{id:data[0].id}}
        })
      } else {alert (message)}
    })
  }

    toUpdate=(id)=>{
        //显示模态框
        this.setState({
          visible:true
        })
        // 1. 通过id查找课程信息
        // 2. 将返回结果设置到this.state.form中
        // state->form
         $.get("http://127.0.0.1:9999/User/findById?id="+id,({status,message,data})=>{
          if(status === 200){
             // 将查询数据设置到state中
            this.setState({
              visible:true,//显示模态框
              "form":data })
          } else {alert (message)}
        })
      }
    delUser = (id)=>{
        
        $.get('http://127.0.0.1:9999/User/Delete?id='+id,({status,message})=>{
        if(status===200){
            this.loadRoleuserAndRole();
            }
            alert(message);
        })
    }
    handleCancel=()=>{//取消 关闭模态框
        this.setState({
            visible:false
        })
    }
    handleOk=(event)=>{//确定 提交信息
        
      let url="http://127.0.0.1:9999/User/saveOrUpdate";
      $.post(url,this.state.form,({message})=>{
          alert(message)
          //刷新页面
          this.loadRoleuserAndRole();
      })
      
      this.setState({
          visible:false
     })
  }
    showModal=()=>{//显示模态框
       
            this.setState({//设置数据
                visible:true,
                form:{
                  name:'',
                  telephone:'',
                  password:'',
                  roleId:this.state.form.roleId
              }
            })
        
    }
    //绑定到输入框双向绑定
    changeHandler = (event)=>{//啥
        let name = event.target.name;
        let value = event.target.value;
        this.setState({
          form:{...this.state.form,...{[name]:value}}
        })
      }
      //批量删除
    start = () => {
      this.setState({ loading: true });
      // ajax request after empty completing
      //批量删除使用selectedRowKeys向后台传数组
      let url = "http://localhost:9999/User/batchDelete";
      $.ajax({
        url:url,
        method:'POST',
        processData:false,
        contentType:'application/json',
        data:JSON.stringify(this.state.selectedRowKeys),
        success:({ message })=>{
          alert(message);
          // 刷新页面
          this.loadRoleuserAndRole();
        }
      })
      console.log(this.state.selectedRowKeys)
      setTimeout(() => {
        this.setState({
          selectedRowKeys: [],
          loading: false,
        });
      }, 1000);
      
    };
     //chackbox数据的的绑定
     onSelectChange = selectedRowKeys => {
      console.log('selectedRowKeys changed: ', selectedRowKeys);
      this.setState({ selectedRowKeys });
      };
       //表单数据绑定事件
    changeHandler = (event) => {
      let name = event.target.name;
      let value = event.target.value;
      this.setState({
      form: { ...this.state.form, ...{ [name]: value } }
      })
  }
  
     

    render(){
      const{users,loading,selectedRowKeys,roles,userAR,form}=this.state;
      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange,
        };
      const hasSelected = selectedRowKeys.length > 0;
        let columns =[{
            title: '姓名',
            dataIndex: 'name'
            
        },{
            title: '电话',
            dataIndex: 'telephone'
        },{
            title: '密码',
            dataIndex: 'password'
        },{
            title:'用户权限',
            dataIndex: 'role.name'

            
        },{
            title: '操作',
            render: (record) => (
                <span>
                    <span onClick={this.delUser.bind(this,record.id)}>删除 </span>
                    <span onClick={this.toUpdate.bind(this,record.id)}>更新
                    </span> 
                    
                </span>
            ),
        }]
        
          // const rowSelection = {
          //   onChange: (selectedRowKeys, selectedRows) => {
          //     console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          //   },
          //   getCheckboxProps: record => ({
          //     disabled: record.roleId === 3, // boss用户不可操作
          //     name: record.roleId,
          //   }),
          // };

        
          
          return (
          
            <div className='user'>
              <h1>用户管理</h1>
                <span>
                <Button onClick={this.showModal}>添加</Button>
                <Button type="danger" onClick={this.start} disabled={!hasSelected} loading={loading}>批量删除</Button>
                </span>
                <span style={{ marginLeft: 8 }}>
                    {hasSelected ? `选中 ${selectedRowKeys.length} 项` : ''}
                </span>
               <Table rowKey={record => record.id} rowSelection={rowSelection} columns={columns} dataSource={this.state.userAR} /> 
               <Modal
            title="用户"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel} 
            cancelText="取消"
            okText="确认"
            maskStyle={{backgroundColor:'rgba(144,144,144,.5)'}}
            >
            {/* {JSON.stringify(form.id)}
            {JSON.stringify(form)} */}
            {/* <span onClick={this.toUpdate.bind(this,record.id)}>加载数据</span> */}
            <form>
                姓名:
                <input type="text" name="name" value={form.name} onChange={this.changeHandler}/> <br/>
                电话:
                <input type="text" name="telephone" value={form.telephone} onChange={this.changeHandler}/> <br/>
                密码:
                <input name="password" value={form.password} onChange={this.changeHandler}></input> <br/>
                权限:
                <select  name="roleId" value={form.productId} onChange={this.changeHandler}>
                        {
                            roles.map((item) => {
                            return <option value={item.id} key={item.id} >{item.name}</option>
                            })
                        }
                        </select><br/>
            </form>
            </Modal>
            </div>
        )
    }
}
export default Usermanager;