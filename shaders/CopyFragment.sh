echo "番号を入力してください。: "
read number 
cp ./Fragment_templete.frag "Fragment${number}.frag"
echo "create Fragment${number}.frag"
glslViewer -w 800 -h 800 -l "Fragment${number}.frag"
echo "open Fragment${number}.frag glslViewer"