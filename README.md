# react-copyable



## 使用


```tsx
const CopyableComponent = Copyable({
    copy({value}){
        return value
    },
    paste({onChange},data){
        onChange({...data})
    }
})


const MyComponent = ({value,onChange})=>{
    return <Input value={value} onChange={(e)=>onChange(e.target.value)}/>
}


export default CopyableComponent(MyComponent);

```


待补充。