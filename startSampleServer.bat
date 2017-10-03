@echo off

java -Xmx512m -XX:MaxPermSize=256m -XX:+UseConcMarkSweepGC -Djava.util.logging.config.file=server\logging.properties -cp server\* com.luciad.samples.luciadria.StartService %*
