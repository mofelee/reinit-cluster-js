const aliyun = require('simple-aliyun');

const wait = (ms)=>new Promise(resolve=>setTimeout(resolve, ms));

(async function(){
  const data = await aliyun.invoke('DescribeInstances', {RegionId: 'cn-shanghai'});

  await Promise.all(data.Instances.Instance.map(async d=>{
    try {
      const id = d.InstanceId;

      await aliyun.invoke('StopInstance', {
        InstanceId: id
      });

      await waitUntil(id, 'Stopped');
      console.log(id, 'stopped');

      await aliyun.invoke('ReplaceSystemDisk', {
        InstanceId: id,
        ImageId: 'ubuntu_16_0402_64_20G_alibase_20180326.vhd',
        KeyPairName: 'mbp15',
      });
      await wait(5000);
      console.log('replaced dsk');

      await aliyun.invoke('StartInstance', {InstanceId: id});
      await waitUntil(id, 'Running');

    } catch (e) {
      console.error(e);
    }
  }));

  console.log('done !!!');
})();

async function waitUntil(id, expectState){
  while(true){
    const result = await aliyun.invoke('DescribeInstanceAttribute', {InstanceId: id});
    if(result.Status === expectState){
      return;
    } else {
      console.log(id, 'wait 3s', expectState);
      await wait(3000);
    }
  }
}
