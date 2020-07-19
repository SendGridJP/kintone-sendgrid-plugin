File.open("sample.csv", mode = "w") do |f|
  f.write("メールアドレス,名前\n")
  for id in 1..510 do
    f.write("sample%03d@sink.sendgrid.net,サンプル%03d\n" % [id, id])
  end
end
