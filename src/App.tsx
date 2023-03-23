import { Component, createSignal, onMount, Show } from 'solid-js';

import styles from './App.module.css';

import { createFFmpeg, CreateFFmpegOptions, fetchFile } from '@ffmpeg/ffmpeg'

const ffmpegInstance = createFFmpeg({ log: true }); 

const App: Component = () => {

  const [isFFmpegReady, setIsFFmpegReady] = createSignal();
  const [testVideo, setTestVideo] = createSignal<Blob | MediaSource>();
  
  const loadFFmpeg = async () => {
    await ffmpegInstance.load()
    setIsFFmpegReady(true)
  }

  const calculateVideoJump = () => {
    
  } 

  const handleBlackFrames = async (e: any) => {
    setTestVideo(e.target.files?.item(0))

    ffmpegInstance.FS('writeFile', 'file.mp4', await fetchFile(testVideo()))


    // const command1 = '-f lavfi -i movie=file.mp4,blackdetect[out0] -show_entries tags=lavfi.black_start,lavfi.black_end -of json=c=1 -v quiet';

    const command = [
      '-i', 'file.mp4',
      '-f', 'lavfi',
      '-i', 'color=black:s=1920x1080:r=24',
      '-filter_complex', '[0:v][1:v]overlay',
      '-c:a', 'copy',
      '-f', 'mp4',
      '-movflags', '+faststart',
      '-vsync', 'vfr',
      '-flags', 'cgop+global_header',
      '/output.mp4'
    ];
    await ffmpegInstance.run(...command);

  const data = await ffmpegInstance.FS('readFile', '/output.json');
  console.log(data);

// Parse the output as JSON

// Filter for black frames and print to console
    // const blackFrames = results.frames.filter(frame => frame.tags.lavfi_black_start);
//console.log(blackFrames);
    // const command = '-f lavfi -i "movie=file.mp4,blackdetect[out0]" -show_entries tags=lavfi.black_start,lavfi.black_end -of json=c=1 -v quiet';
    // await ffmpegInstance.run(command);
    // const output = ffmpegInstance.();
    // const data = JSON.parse(output);
    // const blackFrames = data.frames.filter(frame => frame.tags.lavfi_black_start);

    // ffmpegInstance.run('-f', 'lavfi', '-i', '"movie=file.mp4,blackdetect[out0]"', '-show_entries', 'tags=lavfi.black_start,lavfi.black_end', '-of', 'default=nw=1', '-v', 'quiet');
  }

  onMount(() => {
    loadFFmpeg()
  })
  
  return (
    <>
        <div class="flex flex-col">
          <Show when={typeof testVideo() !== 'undefined'}>
             <video controls width="500" src={URL.createObjectURL(testVideo())}></video>
          </Show>
          <Show when={isFFmpegReady()} fallback={<p>loading</p>}>
              <input type="file" onChange={handleBlackFrames}>button</input>
          </Show>
        </div>
    </>
  );
};

export default App;
